from django.urls import path

from .views import PointOfInterestView
urlpatterns = [
    path('PointOfInterest/', PointOfInterestView.as_view()),
    path('PointOfInterest/<int:pid>', PointOfInterestView.as_view())
]