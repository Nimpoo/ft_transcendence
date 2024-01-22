from setuptools import setup, find_packages


setup(
  name='pong',
  version='0.1',
  packages=find_packages(),
  install_requires=[
    'textual'
  ],
  entry_points={
    'console_scripts': [
      'pong = pong:main',
    ],
  },
)
