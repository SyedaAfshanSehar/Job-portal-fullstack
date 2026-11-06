from django.http import FileResponse, Http404
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from .models import Job, Application
from .serializers import JobSerializer, ApplicationSerializer, RegisterSerializer
from .permissions import IsAdminOrReadOnly


@api_view(["GET", "POST"])
@permission_classes([IsAdminOrReadOnly])
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
@permission_classes([IsAdminUser])
def delete_job(request, id):

    job = get_object_or_404(Job, id=id)
    job.delete()

    return Response({"message": "Job deleted"})


@api_view(["PUT"])
@permission_classes([IsAdminUser])
def update_job(request, id):

    job = get_object_or_404(Job, id=id)

    serializer = JobSerializer(job, data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
def job_detail(request, id):

    job = get_object_or_404(Job, id=id)

    serializer = JobSerializer(job)

    return Response(serializer.data)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def apply_job(request):

    data = request.data.copy()
    serializer = ApplicationSerializer(data=data)

    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(["POST"])
def register_user(request):
    serializer = RegisterSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def profile(request):
    return Response({
        "username": request.user.username,
        "email": request.user.email,
        "is_staff": request.user.is_staff,
    })

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def applications(request):
    applications = Application.objects.filter(user=request.user)
    serializer = ApplicationSerializer(applications, many=True)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def application_resume(request, id):
    application = get_object_or_404(Application, id=id, user=request.user)
    if not application.resume:
        raise Http404("Resume not found.")

    return FileResponse(
        application.resume.open("rb"),
        as_attachment=True,
        filename=application.resume.name.rsplit("/", 1)[-1],
    )