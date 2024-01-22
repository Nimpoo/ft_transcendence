from textual import on
from textual.app import ComposeResult
from textual.screen import Screen
from textual.containers import Container
from textual.widgets import Button


class HomeScreen(Screen):

  def compose(self) -> ComposeResult:
    with Container():
      yield Button('About', id='about', variant='primary')

  @on(Button.Pressed, '#about')
  def change_screen_to_about(self, event: Button.Pressed):
    self.app.switch_screen('about')
