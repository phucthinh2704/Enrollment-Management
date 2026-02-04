import {
	BookOpen,
	CheckCircle2,
	Download,
	Edit2,
	GraduationCap,
	Layers,
	Plus,
	Search,
	Sparkles,
	Trash2,
	User,
	X,
} from "lucide-react";
// Thêm các icon này vào dòng import trên cùng của App.jsx
import {
	// ... các icon cũ
	Clock, // Biểu tượng chờ (Chờ duyệt/Chờ bảo vệ)
	PlayCircle, // Biểu tượng đang chạy (Đang thực hiện)
	XCircle, // Biểu tượng hủy/từ chối
	FileText, // Biểu tượng mới
	Shield, // Biểu tượng bảo vệ
} from "lucide-react";
// Thêm các icon này vào dòng import trên cùng của App.jsx
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";

const API_URL = "http://127.0.0.1:5000/api";

function App() {
	const [dsDeTai, setDsDeTai] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [filterStatus, setFilterStatus] = useState("All");
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [editingItem, setEditingItem] = useState(null);

	// Form State
	const [form, setForm] = useState({
		ten_dt: "",
		sinh_vien: "",
		gvhd: "",
		nam: new Date().getFullYear(),
		linh_vuc: "Công nghệ phần mềm",
	});

	// --- LOGIC THỐNG KÊ (SMART DASHBOARD) ---
	const stats = useMemo(() => {
		const total = dsDeTai.length;
		const completed = dsDeTai.filter(
			(d) => d.trang_thai === "Đã hoàn thành",
		).length;
		const inProgress = dsDeTai.filter(
			(d) => d.trang_thai === "Đang thực hiện",
		).length;

		// Tìm GVHD hướng dẫn nhiều nhất
		const gvCount = {};
		dsDeTai.forEach((d) => {
			if (d.gvhd) gvCount[d.gvhd] = (gvCount[d.gvhd] || 0) + 1;
		});
		const topGV = Object.entries(gvCount).sort((a, b) => b[1] - a[1])[0];

		return {
			total,
			completed,
			inProgress,
			topGV: topGV ? `${topGV[0]} (${topGV[1]})` : "Chưa có",
		};
	}, [dsDeTai]);

	// --- FETCH DATA ---
	const fetchData = async () => {
		try {
			const res = await axios.get(`${API_URL}/detai`);
			setDsDeTai(res.data);
		} catch (error) {
			console.error(error);
		} finally {
			// setIsLoading(false); // Không cần thiết nếu không có loading indicator
		}
	};

	useEffect(() => {
		fetchData();
	}, []);

	// --- HANDLERS ---
	const handleAdd = async () => {
		if (!form.ten_dt || !form.sinh_vien)
			return Swal.fire("Lỗi", "Vui lòng nhập đủ thông tin", "warning");
		try {
			await axios.post(`${API_URL}/detai`, form);
			fetchData();
			setForm({
				ten_dt: "",
				sinh_vien: "",
				gvhd: "",
				nam: new Date().getFullYear(),
				linh_vuc: "Công nghệ phần mềm",
			});
			Swal.fire("Thành công", "Đã đăng ký đề tài", "success");
		} catch (e) {
			console.error(e);
			Swal.fire("Lỗi", "Không thể kết nối server", "error");
		}
	};

	const handleDelete = async (ma_dt) => {
		if (
			(
				await Swal.fire({
					title: "Xóa đề tài?",
					icon: "warning",
					showCancelButton: true,
				})
			).isConfirmed
		) {
			await axios.delete(`${API_URL}/detai/${ma_dt}`);
			fetchData();
			Swal.fire("Đã xóa", "", "success");
		}
	};

	const handleUpdate = async () => {
		await axios.put(`${API_URL}/detai/${editingItem.ma_dt}`, editingItem);
		fetchData();
		setIsEditModalOpen(false);
		Swal.fire("Cập nhật thành công", "", "success");
	};

	// --- EXPORT EXCEL (Fake Function) ---
	const handleExport = () => {
		const header = "Mã ĐT,Tên Đề Tài,Sinh Viên,GVHD,Trạng Thái\n";
		const rows = dsDeTai
			.map(
				(d) =>
					`${d.ma_dt},${d.ten_dt},${d.sinh_vien},${d.gvhd},${d.trang_thai}`,
			)
			.join("\n");
		const blob = new Blob(["\uFEFF" + header + rows], {
			type: "text/csv;charset=utf-8;",
		});
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = "ds_detai.csv";
		link.click();
	};

	// --- FILTER & SORT ---
	const filteredData = useMemo(() => {
		return dsDeTai.filter((dt) => {
			const matchSearch =
				dt.ten_dt.toLowerCase().includes(searchTerm.toLowerCase()) ||
				dt.sinh_vien.toLowerCase().includes(searchTerm.toLowerCase());
			const matchStatus =
				filterStatus === "All" || dt.trang_thai === filterStatus;
			return matchSearch && matchStatus;
		});
	}, [dsDeTai, searchTerm, filterStatus]);

	// Hàm cấu hình hiển thị Badge trạng thái
	const renderStatusBadge = (status) => {
		let style = "";
		let icon = null;

		switch (status) {
			case "Mới đăng ký":
				style =
					"bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200";
				icon = <FileText className="w-3.5 h-3.5" />;
				break;
			case "Chờ duyệt":
				style =
					"bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200";
				icon = <Clock className="w-3.5 h-3.5" />;
				break;
			case "Đang thực hiện":
				style =
					"bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200";
				icon = <PlayCircle className="w-3.5 h-3.5" />;
				break;
			case "Chờ bảo vệ":
				style =
					"bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200";
				icon = <Shield className="w-3.5 h-3.5" />;
				break;
			case "Đã hoàn thành":
				style =
					"bg-teal-100 text-teal-700 border-teal-200 hover:bg-teal-200";
				icon = <CheckCircle2 className="w-3.5 h-3.5" />;
				break;
			case "Đã hủy":
				style =
					"bg-red-100 text-red-700 border-red-200 hover:bg-red-200";
				icon = <XCircle className="w-3.5 h-3.5" />;
				break;
			default:
				style = "bg-slate-100 text-slate-600 border-slate-200";
				icon = <AlertCircle className="w-3.5 h-3.5" />;
		}

		return (
			<span
				className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-colors cursor-default ${style}`}>
				{icon}
				{status}
			</span>
		);
	};

	const getProgressColor = (status) => {
		if (status === "Đã hoàn thành") return "bg-teal-500";
		if (status === "Đã hủy") return "bg-red-500";
		if (status === "Chờ bảo vệ") return "bg-purple-500";
		if (status === "Chờ duyệt") return "bg-orange-400";
		return "bg-blue-600"; // Mặc định
	};
	return (
		<div className="min-h-screen bg-gray-50 text-slate-800 font-sans">
			{/* HEADER */}
			<div className="bg-white border-b border-gray-200 sticky top-0 z-30">
				<div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
					<div className="flex items-center gap-3">
						<div className="bg-linear-to-tr from-blue-600 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-blue-200">
							<GraduationCap className="w-6 h-6 text-white" />
						</div>
						<div>
							<h1 className="text-xl font-bold text-gray-900">
								Thesis Master
							</h1>
							<p className="text-xs text-gray-500 font-medium">
								Hệ thống quản lý đào tạo
							</p>
						</div>
					</div>
					<div className="flex gap-3">
						<button
							onClick={handleExport}
							className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">
							<Download className="w-4 h-4" /> Xuất Báo Cáo
						</button>
					</div>
				</div>
			</div>

			<div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
				{/* 1. SMART DASHBOARD */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
					<div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
						<div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
							<BookOpen className="w-6 h-6" />
						</div>
						<div>
							<p className="text-xs font-bold text-gray-400 uppercase">
								Tổng đề tài
							</p>
							<h3 className="text-2xl font-bold">
								{stats.total}
							</h3>
						</div>
					</div>
					<div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
						<div className="p-3 bg-green-50 text-green-600 rounded-xl">
							<CheckCircle2 className="w-6 h-6" />
						</div>
						<div>
							<p className="text-xs font-bold text-gray-400 uppercase">
								Đã hoàn thành
							</p>
							<h3 className="text-2xl font-bold">
								{stats.completed}
							</h3>
						</div>
					</div>
					<div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
						<div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
							<Layers className="w-6 h-6" />
						</div>
						<div>
							<p className="text-xs font-bold text-gray-400 uppercase">
								Đang thực hiện
							</p>
							<h3 className="text-2xl font-bold">
								{stats.inProgress}
							</h3>
						</div>
					</div>
					<div className="bg-white p-5 rounded-2xl border border-orange-100 shadow-sm flex items-center gap-4 relative overflow-hidden">
						<div className="absolute top-0 right-0 p-2 opacity-10">
							<User className="w-24 h-24" />
						</div>
						<div>
							<p className="text-xs font-bold text-gray-400 uppercase">
								GVHD Tiêu biểu
							</p>
							<h3 className="text-lg font-bold text-orange-600 truncate max-w-50">
								{stats.topGV}
							</h3>
						</div>
					</div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* 2. FORM ĐĂNG KÝ (BÊN TRÁI) */}
					<div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-fit sticky top-24">
						<h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
							<Plus className="w-5 h-5 text-blue-600" /> Đăng ký
							đề tài mới
						</h3>
						<div className="space-y-4">
							<div>
								<label className="text-xs font-semibold text-gray-500 uppercase">
									Tên đề tài
								</label>
								<textarea
									className="w-full mt-1 p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
									rows="2"
									placeholder="Ví dụ: Ứng dụng AI trong y tế..."
									value={form.ten_dt}
									onChange={(e) =>
										setForm({
											...form,
											ten_dt: e.target.value,
										})
									}
								/>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="text-xs font-semibold text-gray-500 uppercase">
										Sinh viên
									</label>
									<input
										className="w-full mt-1 p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
										placeholder="Tên SV"
										value={form.sinh_vien}
										onChange={(e) =>
											setForm({
												...form,
												sinh_vien: e.target.value,
											})
										}
									/>
								</div>
								<div>
									<label className="text-xs font-semibold text-gray-500 uppercase">
										Lĩnh vực
									</label>
									<select
										className="w-full mt-1 p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
										value={form.linh_vuc}
										onChange={(e) =>
											setForm({
												...form,
												linh_vuc: e.target.value,
											})
										}>
										<option>Công nghệ phần mềm</option>
										<option>Trí tuệ nhân tạo (AI)</option>
										<option>Mạng & ATTT</option>
										<option>IoT & Nhúng</option>
										<option>Hệ thống thông tin</option>
										<option>Đa phương tiện & Đồ họa</option>
										<option>Khác</option>
									</select>
								</div>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="text-xs font-semibold text-gray-500 uppercase">
										GVHD
									</label>
									<input
										className="w-full mt-1 p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
										placeholder="Tên GV"
										value={form.gvhd}
										onChange={(e) =>
											setForm({
												...form,
												gvhd: e.target.value,
											})
										}
									/>
								</div>
								<div>
									<label className="text-xs font-semibold text-gray-500 uppercase">
										Năm
									</label>
									<input
										className="w-full mt-1 p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
										type="number"
										value={form.nam}
										onChange={(e) =>
											setForm({
												...form,
												nam: e.target.value,
											})
										}
									/>
								</div>
							</div>
							<button
								onClick={handleAdd}
								className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition active:scale-95">
								Xác nhận đăng ký
							</button>
						</div>
					</div>

					{/* 3. DANH SÁCH (BÊN PHẢI) */}
					<div className="lg:col-span-2 space-y-4">
						{/* Toolbar */}
						<div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
							<div className="relative flex-1">
								<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
								<input
									placeholder="Tìm kiếm..."
									value={searchTerm}
									onChange={(e) =>
										setSearchTerm(e.target.value)
									}
									className="w-full pl-9 pr-4 py-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20"
								/>
							</div>
							<select
								className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium"
								value={filterStatus}
								onChange={(e) =>
									setFilterStatus(e.target.value)
								}>
								<option value="All">Tất cả trạng thái</option>
								<option value="Mới đăng ký">Mới đăng ký</option>
								<option value="Chờ duyệt">Chờ duyệt</option>
								<option value="Đang thực hiện">
									Đang thực hiện
								</option>
								<option value="Chờ bảo vệ">Chờ bảo vệ</option>
								<option value="Đã hoàn thành">
									Đã hoàn thành
								</option>
								<option value="Đã hủy">Đã hủy</option>
							</select>
						</div>

						{/* List View PRO */}
						<div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
							{filteredData.map((dt, idx) => (
								<div
									key={dt.ma_dt}
									className={`p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:bg-gray-50 transition ${idx !== filteredData.length - 1 ? "border-b border-gray-100" : ""}`}>
									{/* Avatar generated from name */}
									<img
										src={`https://ui-avatars.com/api/?name=${dt.sinh_vien}&background=random&color=fff`}
										alt="ava"
										className="w-12 h-12 rounded-full shadow-sm"
									/>

									<div className="flex-1">
										<div className="flex items-center gap-2 mb-1">
											<span className="font-mono text-xs text-gray-400">
												#{dt.ma_dt}
											</span>
											{renderStatusBadge(dt.trang_thai)}
										</div>
										<h4 className="font-bold text-gray-900 leading-tight">
											{dt.ten_dt}
										</h4>
										<div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-gray-600">
											<span className="flex items-center gap-1">
												<User className="w-3 h-3" /> SV:{" "}
												{dt.sinh_vien}
											</span>
											<span className="flex items-center gap-1">
												<GraduationCap className="w-3 h-3" />{" "}
												GV: {dt.gvhd}
											</span>
											<span className="flex items-center gap-1 text-blue-600">
												<Sparkles className="w-3 h-3" />{" "}
												{dt.linh_vuc}
											</span>
										</div>
										{/* Progress Bar */}
										<div className="w-full bg-gray-100 rounded-full h-1.5 mt-3">
											<div className="w-full bg-gray-100 rounded-full h-2 mt-3 overflow-hidden border border-gray-100">
												<div
													className={`h-2 rounded-full transition-all duration-1000 ease-out ${getProgressColor(dt.trang_thai)}`}
													style={{
														width: `${dt.tien_do}%`,
													}}></div>
											</div>
										</div>
									</div>

									<div className="flex gap-2">
										<button
											onClick={() => {
												setEditingItem(dt);
												setIsEditModalOpen(true);
											}}
											className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
											<Edit2 className="w-4 h-4" />
										</button>
										<button
											onClick={() =>
												handleDelete(dt.ma_dt)
											}
											className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
											<Trash2 className="w-4 h-4" />
										</button>
									</div>
								</div>
							))}
							{filteredData.length === 0 && (
								<div className="p-8 text-center text-gray-400">
									Không tìm thấy dữ liệu
								</div>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* MODAL EDIT (Full Feature) */}
			{isEditModalOpen && editingItem && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
					<div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
						<div className="bg-blue-600 p-4 flex justify-between items-center text-white">
							<h3 className="font-bold">Cập nhật tiến độ</h3>
							<button onClick={() => setIsEditModalOpen(false)}>
								<X className="w-5 h-5" />
							</button>
						</div>
						<div className="p-6 space-y-4">
							<div>
								<label className="text-xs font-bold text-gray-500 uppercase">
									Tên đề tài
								</label>
								<input
									className="w-full mt-1 p-2 border rounded-lg"
									value={editingItem.ten_dt}
									onChange={(e) =>
										setEditingItem({
											...editingItem,
											ten_dt: e.target.value,
										})
									}
								/>
							</div>
							<div className="grid grid-cols-2 gap-4">
								{/* Trong Modal Edit */}
								<div>
									<label className="text-xs font-bold text-gray-500 uppercase block mb-1">
										Trạng thái hiện tại
									</label>
									<div className="relative">
										<select
											className="w-full p-2.5 pl-3 pr-10 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none font-medium text-sm"
											value={editingItem.trang_thai}
											onChange={(e) =>
												setEditingItem({
													...editingItem,
													trang_thai: e.target.value,
												})
											}>
											<option value="Mới đăng ký">
												⚪ Mới đăng ký
											</option>
											<option value="Chờ duyệt">
												🟠 Chờ duyệt
											</option>
											<option value="Đang thực hiện">
												🔵 Đang thực hiện
											</option>
											<option value="Chờ bảo vệ">
												🟣 Chờ bảo vệ
											</option>
											<option value="Đã hoàn thành">
												🟢 Đã hoàn thành
											</option>
											<option value="Đã hủy">
												🔴 Đã hủy
											</option>
										</select>
										{/* Mũi tên custom cho đẹp */}
										<div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-500">
											<svg
												className="w-4 h-4"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24">
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth="2"
													d="M19 9l-7 7-7-7"></path>
											</svg>
										</div>
									</div>
								</div>
								<div>
									<label className="text-xs font-bold text-gray-500 uppercase">
										Tiến độ (%)
									</label>
									<input
										type="number"
										min="0"
										max="100"
										className="w-full mt-1 p-2 border rounded-lg"
										value={editingItem.tien_do}
										onChange={(e) =>
											setEditingItem({
												...editingItem,
												tien_do: parseInt(
													e.target.value,
												),
											})
										}
									/>
								</div>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="text-xs font-bold text-gray-500 uppercase">
										Sinh viên
									</label>
									<input
										className="w-full mt-1 p-2 border rounded-lg"
										value={editingItem.sinh_vien}
										onChange={(e) =>
											setEditingItem({
												...editingItem,
												sinh_vien: e.target.value,
											})
										}
									/>
								</div>
								<div>
									<label className="text-xs font-bold text-gray-500 uppercase">
										GVHD
									</label>
									<input
										className="w-full mt-1 p-2 border rounded-lg"
										value={editingItem.gvhd}
										onChange={(e) =>
											setEditingItem({
												...editingItem,
												gvhd: e.target.value,
											})
										}
									/>
								</div>
							</div>
							<button
								onClick={handleUpdate}
								className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 mt-2">
								Lưu thay đổi
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

export default App;
