#!/usr/bin/env python3
#./scrapeLink url regex

from bs4 import BeautifulSoup
import requests
import re
import sys

response = requests.get(sys.argv[1])

soup = BeautifulSoup(response.text, 'html.parser')

links = soup.find_all('a', attrs={'href': re.compile(sys.argv[2])})
print(links[0].get('href'))