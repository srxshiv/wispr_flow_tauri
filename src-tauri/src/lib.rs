#[tauri::command]

fn greet(name : String) -> String {
    format!("Hellow my master {} " , name)
}

pub fn start_wispr() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
