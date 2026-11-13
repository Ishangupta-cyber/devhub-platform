from django.core.exceptions import ValidationError
from django.db import transaction
from django.db.models import Max

from .models import Project, Column, Card
from issues.models import Issue
from pull_requests.models import Pull_Request

LINKABLE_MODELS = {
    'issue': Issue,
    'pull_request': Pull_Request,
}

POSITION_STEP = 10


def create_project(name, repository):
  return Project.objects.create(name=name, repository=repository)


def create_column(name, project, position=None):
  if position is None:
    last = project.columns.aggregate(m=Max("position"))["m"] or 0
    position = last + POSITION_STEP
  return Column.objects.create(name=name, position=position, project=project)


def add_card(link_id, link_type, column):
  model_class = LINKABLE_MODELS.get(str(link_type).lower())
  if not model_class:
    raise ValidationError(f"'{link_type}' is not a linkable type. Use one of: {', '.join(LINKABLE_MODELS)}.")

  repository = column.project.repository
  # Only items from this board's own repository — otherwise a board could pull
  # in (and show the title of) an issue from a private repo elsewhere.
  linked_object = model_class.objects.filter(id=link_id, repository=repository).first()
  if linked_object is None:
    raise ValidationError(f"No {link_type} with id {link_id} in this repository.")

  last = column.cards.aggregate(m=Max("position"))["m"] or 0
  return Card.objects.create(
    project=column.project,
    column=column,
    position=last + POSITION_STEP,
    content_object=linked_object,
  )


def _renumber(column):
  """Spread positions back out to multiples of POSITION_STEP, keeping order.

  The client places a moved card at the midpoint of its neighbours; after
  enough moves into the same gap two cards end up with equal positions.
  """
  cards = list(column.cards.order_by("position", "added_at", "id"))
  for i, c in enumerate(cards, start=1):
    c.position = i * POSITION_STEP
  Card.objects.bulk_update(cards, ["position"])


def move_card(card, column_id=None, position=None):
  with transaction.atomic():
    if column_id is not None and column_id != card.column_id:
      target = Column.objects.filter(id=column_id, project_id=card.project_id).first()
      if target is None:
        raise ValidationError("Target column does not belong to this project.")
      card.column = target
    if position is not None:
      card.position = position
    card.save(update_fields=["column", "position"])

    collision = card.column.cards.filter(position=card.position).exclude(pk=card.pk).exists()
    if collision or card.position <= 0:
      # the moved card should land *before* the one it collided with
      card.position = max(card.position, 1)
      card.save(update_fields=["position"])
      Card.objects.filter(column=card.column, position=card.position).exclude(pk=card.pk).update(position=card.position + 1)
      _renumber(card.column)
      card.refresh_from_db()
  return card
