from django.urls import path
from .views import (
    job_list,
    delete_job,
    update_job,
    job_detail,
    apply_job,
    register_user,
    profile,
    applications,
)

urlpatterns = [
    path("jobs/", job_list),
    path("jobs/<int:id>/", job_detail),
    path("jobs/delete/<int:id>/", delete_job),
    path("jobs/update/<int:id>/", update_job),
    path("apply/", apply_job),

    path("register/", register_user),
    path("profile/", profile),
    path("applications/", applications),
]