from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Job, Application
from .serializers import JobSerializer, ApplicationSerializer

@api_view(["GET", "POST"])
def job_list(request):

    if request.method == "GET":
        jobs = Job.objects.all()
        serializer = JobSerializer(jobs, many=True)
        return Response(serializer.data)

    elif request.method == "POST":

        serializer = JobSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["DELETE"])
def delete_job(request, id):

    job = Job.objects.get(id=id)
    job.delete()

    return Response({"message": "Job deleted"})


@api_view(["PUT"])
def update_job(request, id):

    job = Job.objects.get(id=id)

    serializer = JobSerializer(job, data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)

    return Response(serializer.errors)


@api_view(["GET"])
def job_detail(request, id):

    job = Job.objects.get(id=id)

    serializer = JobSerializer(job)

    return Response(serializer.data)

@api_view(["POST"])
def apply_job(request):

    serializer = ApplicationSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)