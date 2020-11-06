from rest_framework.generics import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import PointOfInterest
from .serializers import PointOfInterestSerializer


class PointOfInterestView(APIView):

    def get(self, request, pid=None):
        """
        Retrieves a page of PoIs and returns them in JSON format

        :param request: Used by Django
        :param pid: The page being requested
        :return: The PoI JSON data
        """
        pois = PointOfInterest.objects.filter(page=pid)
        serializer = PointOfInterestSerializer(pois, many=True)
        return Response({"PointsOfInterest": serializer.data})


    def post(self, request, pid=None):
        """
        Adds a new PoI to the database

        To add a new PoI, send a POST request with the following JSON data:
        {
        "PoI":{
            "uuid": 123455,
            "page": 1,
            "title": "The Title",
            "description": "Description",
            "latitude": "13.500000",
            "longitude": "65.600000"
            }
        }
        """
        # If this request is sent with a pid value, use it to update the record
        if pid:
            poi = PointOfInterest.objects.filter(uuid=pid).first()

        if poi:
            poi_data = request.data.get('PoI')
            serializer = PointOfInterestSerializer(instance=poi, data=poi_data, partial=True)

        if not pid or not poi:
            poi_data = request.data.get('PoI')
            serializer = PointOfInterestSerializer(data=poi_data)

        if serializer.is_valid(raise_exception=True):
            poi_saved = serializer.save()
        return Response({"success": "Point Of Interest '{}' updated successfully".format(poi_saved.title)})

    def delete(self, request, pid):
        """
        Deletes a PoI from the database

        :param request: Used by Django
        :param pid: The UUID of the PoI to be deleted
        :return: 204 if the poi is deleted
        """
        poi = get_object_or_404(PointOfInterest.objects.all(), uuid=pid)
        poi.delete()
        return Response({"message": "Point Of Interest with id `{}` has been deleted.".format(pid)}, status=204)