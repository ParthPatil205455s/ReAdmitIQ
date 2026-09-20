import cv2
import glob
import os
import numpy as np
from PIL import Image

frames_dir = r"C:\Users\parth\Downloads\ReAdmitIQ-Integrated\docs\media\frames"
output_mp4 = r"C:\Users\parth\Downloads\ReAdmitIQ-Integrated\docs\media\readmitiq_demo_video.mp4"
output_gif = r"C:\Users\parth\Downloads\ReAdmitIQ-Integrated\docs\media\readmitiq_demo_video.gif"

frame_files = sorted(glob.glob(os.path.join(frames_dir, "*.png")))
print(f"Found {len(frame_files)} clean frames.")

if not frame_files:
    print("Error: No frame files found!")
    exit(1)

# Titles for all 12 authenticated frames
titles = {
    "frame_01_landing.png": "1/12 — ReAdmitIQ Enterprise Clinical AI Landing",
    "frame_02_login.png": "2/12 — Authentication Portal & Quick Evaluator Personas",
    "frame_03_doctor_dashboard.png": "3/12 — Physician Clinical Workstation & Active Census",
    "frame_04_doctor_patients.png": "4/12 — Bedside Patient Directory & 30-Day Risk Gauges",
    "frame_05_doctor_reports.png": "5/12 — Automated Clinical PDF Discharge Generator",
    "frame_06_admin_dashboard.png": "6/12 — Executive Governance Dashboard & $2.4M Savings",
    "frame_07_admin_analytics.png": "7/12 — Hospital Analytics & CMS Penalty Avoidance",
    "frame_08_model_monitor.png": "8/12 — AI Governance Monitor & 0.942 ROC-AUC Tracking",
    "frame_09_patient_dashboard.png": "9/12 — Patient Recovery Portal & 30-Day Program",
    "frame_10_patient_risk.png": "10/12 — Patient Portal — Personalized Risk Breakdown",
    "frame_11_patient_care_plan.png": "11/12 — Patient Portal — Home Care Plan & Hotline",
    "frame_12_model_card.png": "12/12 — AI Ethics & Algorithmic Transparency Model Card",
}

width, height = 1920, 1080
fps = 30
hold_seconds = 3.0
fade_seconds = 0.8
hold_frames = int(fps * hold_seconds)
fade_frames = int(fps * fade_seconds)

fourcc = cv2.VideoWriter_fourcc(*'mp4v')
video_writer = cv2.VideoWriter(output_mp4, fourcc, fps, (width, height))

gif_images = []

def add_banner(img_bgr, text):
    overlay = img_bgr.copy()
    cv2.rectangle(overlay, (0, 0), (width, 80), (20, 24, 33), -1)
    cv2.addWeighted(overlay, 0.88, img_bgr, 0.12, 0, img_bgr)
    cv2.line(img_bgr, (0, 80), (width, 80), (16, 185, 129), 2)  # Emerald line

    font = cv2.FONT_HERSHEY_SIMPLEX
    cv2.putText(img_bgr, text, (40, 52), font, 1.1, (255, 255, 255), 2, cv2.LINE_AA)
    return img_bgr

processed_frames = []

for idx, fpath in enumerate(frame_files):
    fname = os.path.basename(fpath)
    title = titles.get(fname, "ReAdmitIQ Clinical Decision Support Platform")
    print(f"Processing frame {idx+1}/{len(frame_files)}: {fname}")

    img = cv2.imread(fpath)
    if img is None:
        continue
    if img.shape[0] != height or img.shape[1] != width:
        img = cv2.resize(img, (width, height))

    img = add_banner(img, title)
    processed_frames.append(img)

    # Convert BGR to RGB for GIF
    pil_img = Image.fromarray(cv2.cvtColor(cv2.resize(img, (960, 540)), cv2.COLOR_BGR2RGB))
    gif_images.append(pil_img)

print("Writing MP4 video file...")
for i in range(len(processed_frames)):
    curr_frame = processed_frames[i]
    next_frame = processed_frames[i + 1] if i + 1 < len(processed_frames) else processed_frames[i]

    for _ in range(hold_frames):
        video_writer.write(curr_frame)

    if i + 1 < len(processed_frames):
        for f in range(fade_frames):
            alpha = f / float(fade_frames)
            blended = cv2.addWeighted(curr_frame, 1 - alpha, next_frame, alpha, 0)
            video_writer.write(blended)

video_writer.release()
print(f"Successfully generated MP4 Video: {output_mp4}")

print("Writing GIF video file...")
if gif_images:
    gif_images[0].save(
        output_gif,
        save_all=True,
        append_images=gif_images[1:],
        duration=int(hold_seconds * 1000),
        loop=0
    )
    print(f"Successfully generated GIF Video: {output_gif}")
