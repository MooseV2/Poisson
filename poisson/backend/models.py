from django.db import models

class PointOfInterest(models.Model):
    uuid = models.BigIntegerField()
    page = models.IntegerField()
    title = models.CharField(max_length=64)
    description = models.CharField(max_length=512)
    latitude = models.DecimalField(max_digits=16, decimal_places=12)
    longitude = models.DecimalField(max_digits=16, decimal_places=12)


    class Meta:
        verbose_name = "Point of Interest"
        verbose_name_plural = "Points of Interest"

    def __unicode__(self):
        return f"{self.title} - [{self.latitude}, {self.longitude}] ({self.uuid} / {self.page})"
