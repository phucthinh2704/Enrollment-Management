import json
import os

class DeTai:
    def __init__(self, ma_dt, ten_dt, sinh_vien, gvhd, nam, linh_vuc="", trang_thai="Mới đăng ký", tien_do=0):
        self.ma_dt = ma_dt
        self.ten_dt = ten_dt
        self.sinh_vien = sinh_vien
        self.gvhd = gvhd
        self.nam = nam
        self.linh_vuc = linh_vuc      # New: AI, Web, Mobile...
        self.trang_thai = trang_thai  # New: Mới đăng ký, Đang thực hiện, Đã bảo vệ
        self.tien_do = tien_do        # New: 0 - 100%

    def to_dict(self):
        return {
            "ma_dt": self.ma_dt,
            "ten_dt": self.ten_dt,
            "sinh_vien": self.sinh_vien,
            "gvhd": self.gvhd,
            "nam": self.nam,
            "linh_vuc": self.linh_vuc,
            "trang_thai": self.trang_thai,
            "tien_do": self.tien_do
        }

class QuanLyDeTai:
    def __init__(self, filename='data.json'):
        self.filename = filename
        self.danh_sach = []
        self.doc_file()

    def ghi_file(self):
        data = [dt.to_dict() for dt in self.danh_sach]
        with open(self.filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=4)

    def doc_file(self):
        if os.path.exists(self.filename):
            with open(self.filename, 'r', encoding='utf-8') as f:
                data = json.load(f)
                # Sử dụng .get() để tránh lỗi nếu file json cũ thiếu trường mới
                self.danh_sach = [DeTai(
                    ma_dt=item['ma_dt'],
                    ten_dt=item['ten_dt'],
                    sinh_vien=item['sinh_vien'],
                    gvhd=item['gvhd'],
                    nam=item['nam'],
                    linh_vuc=item.get('linh_vuc', 'Khác'),
                    trang_thai=item.get('trang_thai', 'Mới đăng ký'),
                    tien_do=item.get('tien_do', 0)
                ) for item in data]
        else:
            self.danh_sach = []

    def tao_ma_moi(self):
        if not self.danh_sach: return "DT001"
        max_num = 0
        for dt in self.danh_sach:
            if dt.ma_dt.startswith("DT"):
                try:
                    num = int(dt.ma_dt[2:])
                    if num > max_num: max_num = num
                except: continue
        return f"DT{max_num + 1:03d}"