import {
	BookOpen,
	CheckCircle2,
	Download,
	Edit2,
	GraduationCap,
	Plus,
	Search,
	Trash2,
	User,
	X,
	Clock,
	PlayCircle,
	XCircle,
	FileText,
	Shield,
	LayoutDashboard,
	Settings,
	Bell,
	LogOut,
	Filter,
	MoreVertical,
} from "lucide-react";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";

const API_URL = "http://127.0.0.1:5000/api";

function App() {
	const [dsDeTai, setDsDeTai] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [filterStatus, setFilterStatus] = useState("All");

	// Modal States
	const [isAddModalOpen, setIsAddModalOpen] = useState(false);
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

	// --- LOGIC THỐNG KÊ ---
	const stats = useMemo(() => {
		const total = dsDeTai.length;
		const completed = dsDeTai.filter(
			(d) => d.trang_thai === "Đã hoàn thành",
		).length;
		const inProgress = dsDeTai.filter(
			(d) => d.trang_thai === "Đang thực hiện",
		).length;

		const gvCount = {};
		dsDeTai.forEach((d) => {
			if (d.gvhd) gvCount[d.gvhd] = (gvCount[d.gvhd] || 0) + 1;
		});
		const topGV = Object.entries(gvCount).sort((a, b) => b[1] - a[1])[0];

		return {
			total,
			completed,
			inProgress,
			topGV: topGV ? `${topGV[0]}` : "Chưa có",
			topGVCount: topGV ? topGV[1] : 0,
		};
	}, [dsDeTai]);

	// --- FETCH DATA ---
	const fetchData = async () => {
		try {
			const res = await axios.get(`${API_URL}/detai`);
			setDsDeTai(res.data);
		} catch (error) {
			console.error(error);
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
			setIsAddModalOpen(false); // Đóng modal sau khi thêm
			Swal.fire({
				title: "Thành công",
				text: "Đã đăng ký đề tài",
				icon: "success",
				timer: 1500,
				showConfirmButton: false,
			});
		} catch (e) {
			console.error(e);
			Swal.fire("Lỗi", "Không thể kết nối server", "error");
		}
	};

	const handleDelete = async (ma_dt) => {
		const result = await Swal.fire({
			title: "Xóa đề tài?",
			text: "Hành động này không thể hoàn tác!",
			icon: "warning",
			showCancelButton: true,
			confirmButtonColor: "#ef4444",
			cancelButtonColor: "#6b7280",
			confirmButtonText: "Xóa ngay",
			cancelButtonText: "Hủy",
		});

		if (result.isConfirmed) {
			await axios.delete(`${API_URL}/detai/${ma_dt}`);
			fetchData();
			Swal.fire({
				title: "Đã xóa",
				icon: "success",
				timer: 1500,
				showConfirmButton: false,
			});
		}
	};

	const handleUpdate = async () => {
		await axios.put(`${API_URL}/detai/${editingItem.ma_dt}`, editingItem);
		fetchData();
		setIsEditModalOpen(false);
		Swal.fire({
			title: "Cập nhật thành công",
			icon: "success",
			timer: 1500,
			showConfirmButton: false,
		});
	};

	const handleExport = () => {
		const header = "Mã ĐT,Tên Đề Tài,Sinh Viên,GVHD,Trạng Thái\n";
		const rows = dsDeTai
			.map(
				(d) =>
					`"${d.ma_dt}","${d.ten_dt}","${d.sinh_vien}","${d.gvhd}","${d.trang_thai}"`,
			)
			.join("\n");
		const blob = new Blob(["\uFEFF" + header + rows], {
			type: "text/csv;charset=utf-8;",
		});
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = `Danh_Sach_De_Tai_${new Date().getTime()}.csv`;
		link.click();
	};

	const filteredData = useMemo(() => {
		return dsDeTai.filter((dt) => {
			const matchSearch =
				dt.ten_dt.toLowerCase().includes(searchTerm.toLowerCase()) ||
				dt.sinh_vien.toLowerCase().includes(searchTerm.toLowerCase()) ||
				dt.gvhd.toLowerCase().includes(searchTerm.toLowerCase());
			const matchStatus =
				filterStatus === "All" || dt.trang_thai === filterStatus;
			return matchSearch && matchStatus;
		});
	}, [dsDeTai, searchTerm, filterStatus]);

	// --- UI HELPERS ---
	const getStatusConfig = (status) => {
		switch (status) {
			case "Mới đăng ký":
				return {
					color: "text-slate-700 bg-slate-100 ring-slate-600/20",
					icon: FileText,
					bar: "bg-slate-500",
				};
			case "Chờ duyệt":
				return {
					color: "text-amber-700 bg-amber-50 ring-amber-600/20",
					icon: Clock,
					bar: "bg-amber-500",
				};
			case "Đang thực hiện":
				return {
					color: "text-blue-700 bg-blue-50 ring-blue-600/20",
					icon: PlayCircle,
					bar: "bg-blue-500",
				};
			case "Chờ bảo vệ":
				return {
					color: "text-purple-700 bg-purple-50 ring-purple-600/20",
					icon: Shield,
					bar: "bg-purple-500",
				};
			case "Đã hoàn thành":
				return {
					color: "text-emerald-700 bg-emerald-50 ring-emerald-600/20",
					icon: CheckCircle2,
					bar: "bg-emerald-500",
				};
			case "Đã hủy":
				return {
					color: "text-red-700 bg-red-50 ring-red-600/20",
					icon: XCircle,
					bar: "bg-red-500",
				};
			default:
				return {
					color: "text-gray-700 bg-gray-50 ring-gray-600/20",
					icon: FileText,
					bar: "bg-gray-500",
				};
		}
	};

	return (
		<div className="flex h-screen bg-[#f8fafc] font-sans overflow-hidden">
			{/* SIDEBAR */}
			<aside className="w-64 bg-slate-900 text-slate-300 flex flex-col hidden md:flex">
				<div className="h-16 flex items-center px-6 border-b border-slate-800">
					<div className="flex items-center gap-2 text-white font-bold text-xl tracking-tight">
						<div className="p-1.5 bg-blue-600 rounded-lg">
							<GraduationCap className="w-5 h-5" />
						</div>
						Thesis<span className="text-blue-500">Pro</span>
					</div>
				</div>
				<nav className="flex-1 px-4 py-6 space-y-2">
					<a
						href="#"
						className="flex items-center gap-3 px-3 py-2.5 bg-blue-600/10 text-blue-500 rounded-lg font-medium transition-colors">
						<LayoutDashboard className="w-5 h-5" /> Tổng quan
					</a>
					<a
						href="#"
						className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-800 hover:text-white rounded-lg font-medium transition-colors">
						<BookOpen className="w-5 h-5" /> Quản lý đề tài
					</a>
					<a
						href="#"
						className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-800 hover:text-white rounded-lg font-medium transition-colors">
						<User className="w-5 h-5" /> Sinh viên
					</a>
				</nav>
				<div className="p-4 border-t border-slate-800">
					<a
						href="#"
						className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-800 hover:text-white rounded-lg font-medium transition-colors">
						<Settings className="w-5 h-5" /> Cài đặt
					</a>
				</div>
			</aside>

			{/* MAIN CONTENT */}
			<main className="flex-1 flex flex-col h-screen overflow-hidden">
				{/* TOP HEADER */}
				<header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
					<div className="flex items-center gap-4 flex-1">
						<div className="relative w-96 hidden sm:block">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
							<input
								type="text"
								placeholder="Tìm kiếm sinh viên, giảng viên, tên đề tài..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="w-full pl-10 pr-4 py-2 bg-slate-100 border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl text-sm transition-all outline-none"
							/>
						</div>
					</div>
					<div className="flex items-center gap-4">
						<button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
							<Bell className="w-5 h-5" />
							<span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
						</button>
						<div className="h-8 w-px bg-slate-200"></div>
						<div className="flex items-center gap-2 cursor-pointer">
							<img
								src="https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff"
								alt="Admin"
								className="w-8 h-8 rounded-full shadow-sm"
							/>
							<span className="text-sm font-medium text-slate-700 hidden sm:block">
								Quản trị viên
							</span>
						</div>
					</div>
				</header>

				{/* SCROLLABLE CONTENT */}
				<div className="flex-1 overflow-y-auto p-6 lg:p-8">
					<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
						<div>
							<h1 className="text-2xl font-bold text-slate-900">
								Quản lý Khóa luận
							</h1>
							<p className="text-slate-500 text-sm mt-1">
								Theo dõi và quản lý tiến độ thực hiện đề tài tốt
								nghiệp.
							</p>
						</div>
						<div className="flex items-center gap-3">
							<button
								onClick={handleExport}
								className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 font-medium text-sm transition-all shadow-sm">
								<Download className="w-4 h-4" /> Xuất Excel
							</button>
							<button
								onClick={() => setIsAddModalOpen(true)}
								className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium text-sm transition-all shadow-sm shadow-blue-600/20">
								<Plus className="w-4 h-4" /> Thêm đề tài
							</button>
						</div>
					</div>

					{/* DASHBOARD STATS */}
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
						{[
							{
								label: "Tổng số đề tài",
								value: stats.total,
								icon: BookOpen,
								color: "blue",
							},
							{
								label: "Đang thực hiện",
								value: stats.inProgress,
								icon: PlayCircle,
								color: "violet",
							},
							{
								label: "Đã hoàn thành",
								value: stats.completed,
								icon: CheckCircle2,
								color: "emerald",
							},
							{
								label: "GV Hướng dẫn top",
								value: stats.topGV,
								sub: `${stats.topGVCount} đề tài`,
								icon: User,
								color: "amber",
							},
						].map((stat, idx) => (
							<div
								key={idx}
								className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
								<div
									className={`p-3 rounded-xl bg-${stat.color}-50 text-${stat.color}-600`}>
									<stat.icon className="w-6 h-6" />
								</div>
								<div>
									<p className="text-sm font-medium text-slate-500">
										{stat.label}
									</p>
									<h3 className="text-2xl font-bold text-slate-900 line-clamp-1">
										{stat.value}
									</h3>
									{stat.sub && (
										<p className="text-xs text-slate-400 mt-0.5">
											{stat.sub}
										</p>
									)}
								</div>
							</div>
						))}
					</div>

					{/* DATA TABLE SECTION */}
					<div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
						{/* Table Toolbar */}
						<div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
							<div className="flex items-center gap-2">
								<Filter className="w-4 h-4 text-slate-400" />
								<span className="text-sm font-medium text-slate-700">
									Lọc theo trạng thái:
								</span>
								<select
									className="bg-transparent text-sm font-medium text-slate-900 outline-none cursor-pointer"
									value={filterStatus}
									onChange={(e) =>
										setFilterStatus(e.target.value)
									}>
									<option value="All">
										Tất cả trạng thái
									</option>
									<option value="Mới đăng ký">
										Mới đăng ký
									</option>
									<option value="Chờ duyệt">Chờ duyệt</option>
									<option value="Đang thực hiện">
										Đang thực hiện
									</option>
									<option value="Chờ bảo vệ">
										Chờ bảo vệ
									</option>
									<option value="Đã hoàn thành">
										Đã hoàn thành
									</option>
									<option value="Đã hủy">Đã hủy</option>
								</select>
							</div>
							<span className="text-sm text-slate-500 font-medium">
								Hiển thị {filteredData.length} kết quả
							</span>
						</div>

						{/* Table */}
						<div className="overflow-x-auto">
							<table className="w-full text-left border-collapse">
								<thead>
									<tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
										<th className="p-4 font-semibold w-24">
											Mã ĐT
										</th>
										<th className="p-4 font-semibold">
											Sinh viên
										</th>
										<th className="p-4 font-semibold w-1/3">
											Thông tin đề tài
										</th>
										<th className="p-4 font-semibold">
											GVHD
										</th>
										<th className="p-4 font-semibold">
											Trạng thái
										</th>
										<th className="p-4 font-semibold w-32">
											Tiến độ
										</th>
										<th className="p-4 font-semibold text-right">
											Thao tác
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-slate-100 text-sm">
									{filteredData.length === 0 ? (
										<tr>
											<td
												colSpan="7"
												className="p-8 text-center text-slate-500">
												<div className="flex flex-col items-center justify-center gap-2">
													<Search className="w-8 h-8 text-slate-300" />
													<p>
														Không tìm thấy đề tài
														nào phù hợp.
													</p>
												</div>
											</td>
										</tr>
									) : (
										filteredData.map((dt) => {
											const statusUi = getStatusConfig(
												dt.trang_thai,
											);
											const StatusIcon = statusUi.icon;

											return (
												<tr
													key={dt.ma_dt}
													className="hover:bg-slate-50/50 transition-colors group">
													<td className="p-4 align-top pt-5">
														<span className="font-mono font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md text-xs">
															#{dt.ma_dt}
														</span>
													</td>
													<td className="p-4 align-top">
														<div className="flex items-center gap-3">
															<img
																src={`https://ui-avatars.com/api/?name=${dt.sinh_vien}&background=random&color=fff`}
																alt="ava"
																className="w-8 h-8 rounded-full"
															/>
															<span className="font-semibold text-slate-900">
																{dt.sinh_vien}
															</span>
														</div>
													</td>
													<td className="p-4 align-top">
														<p className="font-semibold text-slate-900 mb-1 leading-snug group-hover:text-blue-600 transition-colors">
															{dt.ten_dt}
														</p>
														<span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-600 border border-blue-100">
															{dt.linh_vuc}
														</span>
													</td>
													<td className="p-4 align-top pt-5">
														<div className="flex items-center gap-1.5 text-slate-700 font-medium">
															<GraduationCap className="w-4 h-4 text-slate-400" />{" "}
															{dt.gvhd}
														</div>
													</td>
													<td className="p-4 align-top pt-5">
														<span
															className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ring-1 ring-inset ${statusUi.color}`}>
															<StatusIcon className="w-3.5 h-3.5" />{" "}
															{dt.trang_thai}
														</span>
													</td>
													<td className="p-4 align-top pt-5">
														<div className="flex items-center gap-2">
															<div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
																<div
																	className={`h-full rounded-full ${statusUi.bar}`}
																	style={{
																		width: `${dt.tien_do}%`,
																	}}></div>
															</div>
															<span className="text-xs font-bold text-slate-600 w-8">
																{dt.tien_do}%
															</span>
														</div>
													</td>
													<td className="p-4 align-top pt-4 text-right">
														<div className="flex items-center justify-end gap-1">
															<button
																onClick={() => {
																	setEditingItem(
																		dt,
																	);
																	setIsEditModalOpen(
																		true,
																	);
																}}
																className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
																title="Cập nhật">
																<Edit2 className="w-4 h-4" />
															</button>
															<button
																onClick={() =>
																	handleDelete(
																		dt.ma_dt,
																	)
																}
																className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
																title="Xóa">
																<Trash2 className="w-4 h-4" />
															</button>
														</div>
													</td>
												</tr>
											);
										})
									)}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</main>

			{/* --- MODALS --- */}

			{/* MODAL THÊM MỚI */}
			{isAddModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
					<div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
						<div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
							<h3 className="font-bold text-lg text-slate-800">
								Đăng ký đề tài mới
							</h3>
							<button
								onClick={() => setIsAddModalOpen(false)}
								className="text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 p-1.5 rounded-full transition-colors">
								<X className="w-5 h-5" />
							</button>
						</div>
						<div className="p-6 space-y-4">
							<div>
								<label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">
									Tên đề tài
								</label>
								<textarea
									className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm transition-all resize-none"
									rows="2"
									placeholder="Nhập tên khóa luận..."
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
									<label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">
										Sinh viên
									</label>
									<input
										className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm transition-all"
										placeholder="Họ tên sinh viên"
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
									<label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">
										Lĩnh vực
									</label>
									<select
										className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm transition-all"
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
									<label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">
										GV Hướng Dẫn
									</label>
									<input
										className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm transition-all"
										placeholder="Tên giảng viên"
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
									<label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">
										Năm thực hiện
									</label>
									<input
										type="number"
										className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm transition-all"
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
							<div className="pt-2">
								<button
									onClick={handleAdd}
									className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20 active:scale-[0.98]">
									Xác nhận đăng ký
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* MODAL CẬP NHẬT */}
			{isEditModalOpen && editingItem && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
					<div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
						<div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-blue-600">
							<h3 className="font-bold text-lg text-white">
								Cập nhật tiến độ
							</h3>
							<button
								onClick={() => setIsEditModalOpen(false)}
								className="text-blue-100 hover:text-white bg-blue-700/50 hover:bg-blue-700 p-1.5 rounded-full transition-colors">
								<X className="w-5 h-5" />
							</button>
						</div>
						<div className="p-6 space-y-4">
							<div>
								<label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">
									Tên đề tài
								</label>
								<textarea
									className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white outline-none text-sm transition-all resize-none"
									rows="2"
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
								<div>
									<label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">
										Trạng thái hiện tại
									</label>
									<select
										className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm transition-all font-medium"
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
								</div>
								<div>
									<label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">
										Tiến độ ({editingItem.tien_do}%)
									</label>
									<input
										type="range"
										min="0"
										max="100"
										step="5"
										className="w-full mt-3 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
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
									<label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">
										Sinh viên
									</label>
									<input
										className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white outline-none text-sm"
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
									<label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">
										GV Hướng dẫn
									</label>
									<input
										className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white outline-none text-sm"
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
							<div className="pt-2">
								<button
									onClick={handleUpdate}
									className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20 active:scale-[0.98]">
									Lưu thay đổi
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

export default App;
