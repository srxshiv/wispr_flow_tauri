// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use wispr_clone_lib::start_wispr;

fn main() {
    start_wispr();
}
