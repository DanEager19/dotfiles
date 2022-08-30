#!/usr/bin/env python3
from bs4 import BeautifulSoup
import requests
import re

def get_HTML(url):
    response = requests.get(url)
    return response.text

baseUrl = 'https://hex-rays.com/ida-free/'

htmlDoc = get_HTML(baseUrl)

soup = BeautifulSoup(htmlDoc, 'html.parser')

for link in soup.find_all('a', attrs={'href': re.compile('^https://*(.+)linux\.run$')}):
    print(link.get('href'))