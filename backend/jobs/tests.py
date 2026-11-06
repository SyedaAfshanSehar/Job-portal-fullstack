import os
from tempfile import TemporaryDirectory

from django.contrib.auth.models import User
from django.conf import settings
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from .models import Application, Job


class ApplicationAccessTests(TestCase):
    def setUp(self):
        self.owner = User.objects.create_user(username="owner", password="pass")
        self.other_user = User.objects.create_user(
            username="other", password="pass"
        )
        self.job = Job.objects.create(
            title="Developer",
            company="Example",
            location="Remote",
            salary="100",
            description="Role",
        )
        self.owner_application = Application.objects.create(
            job=self.job,
            user=self.owner,
            name="Owner",
            email="owner@example.com",
            phone="123",
            cover_letter="Owner application",
        )
        self.other_application = Application.objects.create(
            job=self.job,
            user=self.other_user,
            name="Other",
            email="other@example.com",
            phone="456",
            cover_letter="Other application",
        )
        self.client = APIClient()

    def test_applications_require_authentication(self):
        response = self.client.get("/api/applications/")

        self.assertEqual(response.status_code, 401)

    def test_applications_are_limited_to_authenticated_user(self):
        self.client.force_authenticate(user=self.owner)

        response = self.client.get("/api/applications/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            [application["id"] for application in response.data],
            [self.owner_application.id],
        )

    def test_resume_download_requires_authentication(self):
        response = self.client.get(
            f"/api/applications/{self.owner_application.id}/resume/"
        )

        self.assertEqual(response.status_code, 401)

    def test_resume_download_is_limited_to_owner(self):
        with TemporaryDirectory() as media_root:
            with override_settings(MEDIA_ROOT=media_root):
                self.owner_application.resume.save(
                    "resume.pdf",
                    SimpleUploadedFile("resume.pdf", b"resume contents"),
                )
                self.client.force_authenticate(user=self.other_user)

                response = self.client.get(
                    f"/api/applications/{self.owner_application.id}/resume/"
                )

                self.assertEqual(response.status_code, 404)

    def test_media_files_are_not_publicly_served(self):
        response = self.client.get("/media/resumes/private.pdf")

        self.assertEqual(response.status_code, 404)

    def test_owner_can_download_resume(self):
        with TemporaryDirectory() as media_root:
            with override_settings(MEDIA_ROOT=media_root):
                self.owner_application.resume.save(
                    "resume.pdf",
                    SimpleUploadedFile("resume.pdf", b"resume contents"),
                )
                self.client.force_authenticate(user=self.owner)

                response = self.client.get(
                    f"/api/applications/{self.owner_application.id}/resume/"
                )

                self.assertEqual(response.status_code, 200)
                self.assertEqual(
                    b"".join(response.streaming_content), b"resume contents"
                )


class JobAuthorizationTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="applicant", password="pass")
        self.staff = User.objects.create_user(
            username="staff", password="pass", is_staff=True
        )
        self.job = Job.objects.create(
            title="Developer",
            company="Example",
            location="Remote",
            salary="100",
            description="Role",
        )
        self.client = APIClient()
        self.job_data = {
            "title": "Designer",
            "company": "New Company",
            "location": "Hybrid",
            "salary": "200",
            "description": "Updated role",
            "job_type": "Hybrid",
            "logo": "",
        }

    def test_jobs_are_publicly_readable(self):
        response = self.client.get("/api/jobs/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)

    def test_anonymous_users_cannot_write_jobs(self):
        create_response = self.client.post("/api/jobs/", self.job_data)
        update_response = self.client.put(
            f"/api/jobs/update/{self.job.id}/", self.job_data
        )
        delete_response = self.client.delete(
            f"/api/jobs/delete/{self.job.id}/"
        )

        self.assertEqual(create_response.status_code, 401)
        self.assertEqual(update_response.status_code, 401)
        self.assertEqual(delete_response.status_code, 401)
        self.assertTrue(Job.objects.filter(id=self.job.id).exists())
        self.assertEqual(Job.objects.count(), 1)

    def test_authenticated_non_staff_users_cannot_write_jobs(self):
        self.client.force_authenticate(user=self.user)

        create_response = self.client.post("/api/jobs/", self.job_data)
        update_response = self.client.put(
            f"/api/jobs/update/{self.job.id}/", self.job_data
        )
        delete_response = self.client.delete(
            f"/api/jobs/delete/{self.job.id}/"
        )

        self.assertEqual(create_response.status_code, 403)
        self.assertEqual(update_response.status_code, 403)
        self.assertEqual(delete_response.status_code, 403)
        self.assertTrue(Job.objects.filter(id=self.job.id).exists())
        self.assertEqual(Job.objects.count(), 1)

    def test_staff_users_can_create_update_and_delete_jobs(self):
        self.client.force_authenticate(user=self.staff)

        create_response = self.client.post("/api/jobs/", self.job_data)
        self.assertEqual(create_response.status_code, 201)
        created_job_id = create_response.data["id"]

        update_response = self.client.put(
            f"/api/jobs/update/{created_job_id}/",
            {**self.job_data, "title": "Senior Designer"},
        )
        self.assertEqual(update_response.status_code, 200)
        self.assertEqual(update_response.data["title"], "Senior Designer")

        delete_response = self.client.delete(
            f"/api/jobs/delete/{created_job_id}/"
        )
        self.assertEqual(delete_response.status_code, 200)
        self.assertFalse(Job.objects.filter(id=created_job_id).exists())

    def test_nonexistent_job_update_and_delete_return_404_for_staff(self):
        self.client.force_authenticate(user=self.staff)

        update_response = self.client.put(
            "/api/jobs/update/99999/", self.job_data
        )
        delete_response = self.client.delete("/api/jobs/delete/99999/")

        self.assertEqual(update_response.status_code, 404)
        self.assertEqual(delete_response.status_code, 404)

    def test_profile_reports_staff_status_for_frontend_authorization_ui(self):
        self.client.force_authenticate(user=self.staff)

        response = self.client.get("/api/profile/")

        self.assertEqual(response.status_code, 200)
        self.assertIs(response.data["is_staff"], True)


class RegistrationSecurityTests(TestCase):
    def test_weak_password_is_rejected_with_safe_field_error(self):
        response = self.client.post(
            "/api/register/",
            {
                "username": "new-user",
                "email": "new-user@example.com",
                "password": "12345678",
            },
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("password", response.data)
        self.assertFalse(User.objects.filter(username="new-user").exists())
        self.assertNotIn("12345678", str(response.data))

    def test_valid_registration_creates_user_with_hashed_password(self):
        password = "N6!vQz#4mP8$xL2"
        response = self.client.post(
            "/api/register/",
            {
                "username": "new-user",
                "email": "new-user@example.com",
                "password": password,
            },
        )

        self.assertEqual(response.status_code, 201)
        self.assertNotIn("password", response.data)
        user = User.objects.get(username="new-user")
        self.assertTrue(user.check_password(password))


class SecuritySettingsTests(TestCase):
    def test_cors_and_csrf_origins_follow_environment_configuration(self):
        expected_cors_origins = [
            origin.strip().rstrip("/")
            for origin in os.environ.get(
                "CORS_ALLOWED_ORIGINS",
                "http://localhost:3000,http://127.0.0.1:3000",
            ).split(",")
            if origin.strip()
        ]
        expected_csrf_origins = [
            origin.strip().rstrip("/")
            for origin in os.environ.get(
                "CSRF_TRUSTED_ORIGINS",
                "http://localhost:3000,http://127.0.0.1:3000",
            ).split(",")
            if origin.strip()
        ]

        self.assertEqual(settings.CORS_ALLOWED_ORIGINS, expected_cors_origins)
        self.assertEqual(settings.CSRF_TRUSTED_ORIGINS, expected_csrf_origins)
        self.assertFalse(getattr(settings, "CORS_ALLOW_ALL_ORIGINS", False))
