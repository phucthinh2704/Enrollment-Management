from flask import Flask, jsonify, request
from flask_cors import CORS
from quan_ly_de_tai import QuanLyDeTai, DeTai

app = Flask(__name__)
CORS(app)

ql = QuanLyDeTai()

@app.route('/api/detai', methods=['GET'])
def get_all():
    return jsonify([dt.to_dict() for dt in ql.danh_sach])

@app.route('/api/detai', methods=['POST'])
def add_new():
    data = request.json
    ma_moi = ql.tao_ma_moi() 
    # Mặc định tiến độ 0% và trạng thái Mới đăng ký
    moi = DeTai(ma_moi, data['ten_dt'], data['sinh_vien'], data['gvhd'], data['nam'], 
                data.get('linh_vuc', 'Khác'), "Mới đăng ký", 0)
    ql.danh_sach.append(moi)
    ql.ghi_file()
    return jsonify({"message": "Thêm thành công", "ma_dt": ma_moi}), 201

@app.route('/api/detai/<ma_dt>', methods=['PUT'])
def update_item(ma_dt):
    data = request.json
    for dt in ql.danh_sach:
        if dt.ma_dt == ma_dt:
            dt.ten_dt = data.get('ten_dt', dt.ten_dt)
            dt.sinh_vien = data.get('sinh_vien', dt.sinh_vien)
            dt.gvhd = data.get('gvhd', dt.gvhd)
            dt.nam = data.get('nam', dt.nam)
            dt.linh_vuc = data.get('linh_vuc', dt.linh_vuc)
            dt.trang_thai = data.get('trang_thai', dt.trang_thai)
            dt.tien_do = data.get('tien_do', dt.tien_do)
            ql.ghi_file()
            return jsonify({"message": "Cập nhật thành công"})
    return jsonify({"message": "Not found"}), 404

@app.route('/api/detai/<ma_dt>', methods=['DELETE'])
def delete_item(ma_dt):
    ql.danh_sach = [dt for dt in ql.danh_sach if dt.ma_dt != ma_dt]
    ql.ghi_file()
    return jsonify({"message": "Đã xóa"})

if __name__ == '__main__':
    app.run(debug=True, port=5000)