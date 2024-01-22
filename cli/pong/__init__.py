from textual.app import App
from screens.Home import HomeScreen
from screens.About import AboutScreen


class Pong(App):

  SCREENS = {
    'home': HomeScreen,
    'about': AboutScreen,
  }

  def on_mount(self) -> None:
    self.push_screen('home')

def main():
  pong = Pong()
  pong.run()
