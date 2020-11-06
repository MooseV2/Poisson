from django.shortcuts import render, redirect
from random import randint

def index(request, pageid=None):
    # If we get the root page, redirect to a random page
    if pageid is None:
        return redirect(f"/{randint(1, 1000)}")
    return render(request, 'index.html')