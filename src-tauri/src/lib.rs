use enigo::{Enigo, Keyboard, Settings};
use tauri::{Manager, Emitter}; 
use tauri_plugin_global_shortcut::{Code, Modifiers, ShortcutState};

#[tauri::command]
fn type_live(text: String) {
    if let Ok(mut enigo) = Enigo::new(&Settings::default()) {
        let _ = enigo.text(&text);
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn start_wispr() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_shortcut("Alt+K") 
                .unwrap()
                .with_handler(|app, shortcut, event| {
                    if event.state() == ShortcutState::Pressed {
                        if shortcut.matches(Modifiers::ALT, Code::KeyK) {
                            
                            if let Some(window) = app.get_webview_window("main") {
                                let _ = window.show();
                                let _ = window.set_focus();
                                let _ = window.emit("toggle_recording", ()); 
                            }
                        }
                    }
                })
                .build(),
        ) 
        .invoke_handler(tauri::generate_handler![type_live]) 
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}