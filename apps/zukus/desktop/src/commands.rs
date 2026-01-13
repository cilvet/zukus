// Comandos de Tauri expuestos al frontend
//
// Ejemplo:
//
// #[tauri::command]
// pub fn greet(name: &str) -> String {
//     format!("Hello, {}!", name)
// }
//
// Luego añadir a lib.rs:
// .invoke_handler(tauri::generate_handler![commands::greet])
