from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from serializer import UserSerializer

class UserProfileView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user