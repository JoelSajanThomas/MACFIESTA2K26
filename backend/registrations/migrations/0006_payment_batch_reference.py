# Generated manually for payment batch / reference fields

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("registrations", "0005_ops_payment_hospitality_fields"),
    ]

    operations = [
        migrations.AddField(
            model_name="registration",
            name="payment_batch_id",
            field=models.CharField(blank=True, db_index=True, max_length=40),
        ),
        migrations.AddField(
            model_name="registration",
            name="payment_reference",
            field=models.CharField(blank=True, db_index=True, max_length=32),
        ),
    ]
