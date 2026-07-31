from django.db import models

class Job(models.Model):
    title = models.CharField(max_length=200)
    company = models.CharField(max_length=200)
    location = models.CharField(max_length=100)
    salary = models.CharField(max_length=100)
    description = models.TextField()
    job_type = models.CharField(max_length=20, default="Remote")
    posted_date = models.DateField(auto_now_add=True)
    logo = models.URLField(blank=True, null=True)    
    def __str__(self):
        return self.title

class Application(models.Model):
    job = models.ForeignKey(Job, on_delete=
                            models.CASCADE)
    
    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    resume = models.FileField(upload_to="resumes/")
    cover_letter = models.TextField()

    def __str__(self):
        return self.name
    