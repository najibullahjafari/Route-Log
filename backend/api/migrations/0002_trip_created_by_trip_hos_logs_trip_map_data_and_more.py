import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='trip',
            name='created_by',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE,
                                    related_name='trips', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='trip',
            name='hos_logs',
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.AddField(
            model_name='trip',
            name='map_data',
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.AddField(
            model_name='trip',
            name='route_summary',
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.AddField(
            model_name='trip',
            name='updated_at',
            field=models.DateTimeField(auto_now=True),
        ),
    ]
