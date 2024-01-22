from textual import on
from textual.app import ComposeResult
from textual.screen import Screen
from textual.containers import Container
from textual.widgets import Button


class AboutScreen(Screen):

  def compose(self) -> ComposeResult:
    with Container():
      yield Button('back', id='back', variant='primary')

  @on(Button.Pressed, '#back')
  def change_screen_to_about(self, event: Button.Pressed):
    self.app.switch_screen('home')
