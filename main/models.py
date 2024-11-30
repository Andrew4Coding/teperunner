from django.db import models

class Log(models.Model):
    ip = models.CharField(max_length=200)
    user_agent = models.CharField(max_length=200)
    query = models.CharField(max_length=200)
    timestamp = models.DateTimeField(auto_now_add=True)