"""
Second Brain - Kivy Android App
Minimal, real-world capture + sync + GitHub push
"""

import os
import json
import requests
from datetime import datetime
from pathlib import Path

from kivy.app import App
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.gridlayout import GridLayout
from kivy.uix.label import Label
from kivy.uix.textinput import TextInput
from kivy.uix.button import Button
from kivy.uix.spinner import Spinner
from kivy.uix.popup import Popup
from kivy.uix.scrollview import ScrollView
from kivy.garden.matplotlib.backend_kivyagg import FigureCanvasKivyAgg
from kivy.core.window import Window
from kivy.clock import Clock

import subprocess
import threading

Window.size = (400, 800)


class SecondBrainApp(App):
    """
    Kivy app for capturing learnings, managing inbox, and syncing with GitHub
    """
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.title = 'Second Brain'
        
        # Paths
        self.home = str(Path.home())
        self.brain_dir = os.path.join(self.home, '.local/share/second-brain')
        self.inbox_file = os.path.join(self.brain_dir, 'inbox.json')
        self.captures_dir = os.path.join(self.brain_dir, 'captures')
        
        # Ensure dirs exist
        Path(self.brain_dir).mkdir(parents=True, exist_ok=True)
        Path(self.captures_dir).mkdir(parents=True, exist_ok=True)
        
        # API endpoint
        self.api_url = os.getenv('BRAIN_API', 'http://localhost:5000')
        self.inbox = []
        self.load_inbox()
    
    def load_inbox(self):
        """Load inbox from JSON"""
        try:
            if os.path.exists(self.inbox_file):
                with open(self.inbox_file) as f:
                    data = json.load(f)
                    self.inbox = data.get('items', [])
        except:
            self.inbox = []
    
    def save_inbox(self):
        """Save inbox to JSON"""
        with open(self.inbox_file, 'w') as f:
            json.dump({'items': self.inbox}, f, indent=2)
    
    def build(self):
        """Build UI"""
        layout = BoxLayout(orientation='vertical', padding=10, spacing=10)
        
        # Header
        header = Label(text='[b]Second Brain[/b]', markup=True, size_hint_y=0.08)
        layout.add_widget(header)
        
        # Tabs (capture vs inbox view)
        self.view = 'capture'
        tab_layout = BoxLayout(size_hint_y=0.08, spacing=5)
        
        btn_capture = Button(text='Capture', background_color=(0.2, 0.6, 0.8, 1))
        btn_inbox = Button(text='Inbox', background_color=(0.2, 0.6, 0.8, 1))
        btn_sync = Button(text='Sync', background_color=(0.2, 0.6, 0.8, 1))
        
        btn_capture.bind(on_press=self.show_capture_view)
        btn_inbox.bind(on_press=self.show_inbox_view)
        btn_sync.bind(on_press=self.show_sync_view)
        
        tab_layout.add_widget(btn_capture)
        tab_layout.add_widget(btn_inbox)
        tab_layout.add_widget(btn_sync)
        layout.add_widget(tab_layout)
        
        # Content area
        self.content = BoxLayout(orientation='vertical')
        layout.add_widget(self.content)
        
        # Show default view
        self.show_capture_view()
        
        return layout
    
    def show_capture_view(self, *args):
        """Show capture form"""
        self.view = 'capture'
        self.content.clear_widgets()
        
        form = BoxLayout(orientation='vertical', padding=10, spacing=10)
        
        # Type selector
        type_spinner = Spinner(
            text='learning',
            values=('learning', 'bug-fix', 'insight', 'pattern', 'note'),
            size_hint_y=0.1
        )
        form.add_widget(type_spinner)
        
        # Content input
        content_input = TextInput(
            hint_text='What did you learn?',
            multiline=True,
            size_hint_y=0.6
        )
        form.add_widget(content_input)
        
        # Project input
        project_input = TextInput(
            hint_text='Project (optional)',
            multiline=False,
            size_hint_y=0.1
        )
        form.add_widget(project_input)
        
        # Save button
        def save_capture():
            if not content_input.text.strip():
                self.show_toast('Empty content')
                return
            
            capture = {
                'id': f"cap_{datetime.now().timestamp()}",
                'type': type_spinner.text,
                'content': content_input.text,
                'project': project_input.text or 'general',
                'timestamp': datetime.now().isoformat()
            }
            
            self.inbox.append(capture)
            self.save_inbox()
            
            # Clear
            content_input.text = ''
            project_input.text = ''
            
            self.show_toast(f'✓ Saved {capture["type"]}')
        
        save_btn = Button(text='Save', size_hint_y=0.1, background_color=(0.2, 0.8, 0.2, 1))
        save_btn.bind(on_press=lambda x: save_capture())
        form.add_widget(save_btn)
        
        self.content.add_widget(form)
    
    def show_inbox_view(self, *args):
        """Show inbox list"""
        self.view = 'inbox'
        self.content.clear_widgets()
        
        scroll = ScrollView()
        grid = GridLayout(cols=1, spacing=5, size_hint_y=None)
        grid.bind(minimum_height=grid.setter('height'))
        
        if not self.inbox:
            grid.add_widget(Label(text='No items', size_hint_y=None, height=40))
        else:
            for item in reversed(self.inbox):  # Latest first
                item_btn = Button(
                    text=f"[{item['type']}] {item['content'][:50]}...",
                    size_hint_y=None,
                    height=60,
                    background_color=(0.1, 0.1, 0.1, 1)
                )
                grid.add_widget(item_btn)
        
        scroll.add_widget(grid)
        self.content.add_widget(scroll)
    
    def show_sync_view(self, *args):
        """Show sync status and controls"""
        self.view = 'sync'
        self.content.clear_widgets()
        
        layout = BoxLayout(orientation='vertical', padding=10, spacing=10)
        
        # Status
        status_label = Label(
            text=f'Inbox: {len(self.inbox)} items\nAPI: {self.api_url}',
            size_hint_y=0.3
        )
        layout.add_widget(status_label)
        
        # Push button
        def push_to_github():
            status_label.text = 'Pushing to GitHub...'
            self.run_sync_task('push')
        
        push_btn = Button(text='Push to GitHub', size_hint_y=0.2, background_color=(0.8, 0.2, 0.2, 1))
        push_btn.bind(on_press=lambda x: push_to_github())
        layout.add_widget(push_btn)
        
        # Pull button
        def pull_from_github():
            status_label.text = 'Pulling from GitHub...'
            self.run_sync_task('pull')
        
        pull_btn = Button(text='Pull from GitHub', size_hint_y=0.2, background_color=(0.2, 0.8, 0.2, 1))
        pull_btn.bind(on_press=lambda x: pull_from_github())
        layout.add_widget(pull_btn)
        
        # Logs
        logs_label = Label(text='Sync logs will appear here', size_hint_y=0.3, markup=True)
        layout.add_widget(logs_label)
        
        self.content.add_widget(layout)
    
    def run_sync_task(self, action):
        """Run sync task in background"""
        def bg_task():
            try:
                result = subprocess.run(
                    [f'powershell.exe', '-ExecutionPolicy', 'Bypass', 
                     '-File', f'{self.home}/Scripts/windows-sync-{action}.ps1'],
                    capture_output=True,
                    text=True,
                    timeout=30
                )
                Clock.schedule_once(lambda x: self.show_toast(f'✓ {action} done'), 0)
            except Exception as e:
                Clock.schedule_once(lambda x: self.show_toast(f'✗ {action} failed'), 0)
        
        thread = threading.Thread(target=bg_task, daemon=True)
        thread.start()
    
    def show_toast(self, message):
        """Show toast notification"""
        popup = Popup(title='', size_hint=(0.8, 0.2))
        popup.content = Label(text=message)
        popup.open()
        Clock.schedule_once(popup.dismiss, 2)


if __name__ == '__main__':
    SecondBrainApp().run()
