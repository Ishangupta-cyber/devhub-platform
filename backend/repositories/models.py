from django.conf import settings
from django.db import models
from organisations.models import Organisation,Membership


class Repository(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    organization = models.ForeignKey(
        Organisation,
        related_name='repositories',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='repositories',
        on_delete=models.CASCADE
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('owner', 'name')
        ordering = ['-created_at']

    def user_can_manage(self, user):
        if not user or not user.is_authenticated:
            return False
        if self.owner == user:
            return True
        if self.organization:
            return Membership.objects.filter(
                organisation=self.organization,
                user=user,
                role__in=['owner', 'admin']
            ).exists()
        return False

    def __str__(self):
        return f"{self.owner.username}/{self.name}"