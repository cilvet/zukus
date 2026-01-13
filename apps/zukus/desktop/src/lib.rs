mod commands;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::default().build())
        .invoke_handler(tauri::generate_handler![
            // Añadir comandos aquí cuando existan:
            // commands::mi_comando,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
