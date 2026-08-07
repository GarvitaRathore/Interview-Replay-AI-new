from django.contrib.auth.tokens import PasswordResetTokenGenerator
class EmailVerificationTokenGenerator(PasswordResetTokenGenerator):
    def _make_hash_value(self, user, timestamp):
        # including is_verified means the token stops working the moment
        # it's used once, since is_verified flips from False to True
        return f"{user.pk}{timestamp}{user.is_verified}"


email_verification_token = EmailVerificationTokenGenerator()