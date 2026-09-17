from django.conf import settings
from django.db import models
from organisations.models import Organisation,Membership


class Repository(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    is_public = models.BooleanField(
        default=True,
        help_text='Public repo koi bhi padh sakta hai. Private sirf owner aur '
                  'organisation members ko dikhta hai.'
    )
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

    def user_can_view(self, user):
        """Read access. Manage se dheela hai - plain 'member' bhi padh sakta hai."""
        if self.is_public:
            return True
        if not user or not user.is_authenticated:
            return False
        if self.owner == user:
            return True
        if self.organization:
            return Membership.objects.filter(
                organisation=self.organization,
                user=user
            ).exists()
        return False

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