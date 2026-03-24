import path from "path";

export default [
	{
		path: '/user',
		layout: false,
		routes: [
			{
				path: '/user/login',
				layout: false,
				name: 'login',
				component: './user/Login',
			},
			{
				path: '/user',
				redirect: '/user/login',
			},
		],
	},

	///////////////////////////////////
	// DEFAULT MENU
	{
		path: '/dashboard',
		name: 'Dashboard',
		component: './TrangChu',
		icon: 'HomeOutlined',
	},
	{
		path: '/gioi-thieu',
		name: 'About',
		component: './TienIch/GioiThieu',
		hideInMenu: true,
	},
	{
		path: '/random-user',
		name: 'RandomUser',
		component: './RandomUser',
		icon: 'ArrowsAltOutlined',
	},
	{
		path: '/todo-list',
		name: 'TodoList',
		icon: 'OrderedListOutlined',
		component: './TodoList',
	},
	{
		path: '/QuanLySanPham',
		name: 'Quản lý sản phẩm',
		icon: 'ShoppingOutlined',
		component: './QuanLySanPham',
	},
	{
		path: '/QuanLyDonHang',
		name: 'Quản lý đơn hàng',
		icon: 'ShoppingCartOutlined',
		component: './QuanLyDonHang',
	},
	{
		path: '/TroChoiDoanSo',
		name: 'Trò chơi đoán số',
		icon: 'SmileOutlined',
		component: './TroChoiDoanSo',
	},
	{
		path: '/QuanLyHocTap',
		name: 'Quản lý học tập',
		icon: 'BookOutlined',
		component: './QuanLyHocTap',
	},
	{
		path: '/KeoBuaBao',
		name: 'Trò chơi Kéo Búa Bao',
		icon: 'ScissorOutlined',
		component: './KeoBuaBao',
	},
	{
		path: '/QuanLyCauHoiTuLuan',
		name: 'Quản lý câu hỏi tự luận',
		icon: 'QuestionOutlined',
		component: './QuanLyCauHoiTuLuan',
	},
	{
		path: '/QuanLyDatLich',
		name: 'Quản lý đặt lịch',
		icon: 'CalendarOutlined',
		component: './QuanLyDatLich',
	},
	{
		path: '/QuanLyVanBangTotNghiep',
		name: 'Quản lý văn bằng tốt nghiệp',
		icon: 'FileDoneOutlined',
		component: './QuanLyVanBangTotNghiep',
	},

	// DANH MUC HE THONG
	// {
	// 	name: 'DanhMuc',
	// 	path: '/danh-muc',
	// 	icon: 'copy',
	// 	routes: [
	// 		{
	// 			name: 'ChucVu',
	// 			path: 'chuc-vu',
	// 			component: './DanhMuc/ChucVu',
	// 		},
	// 	],
	// },

	{
		path: '/notification',
		routes: [
			{
				path: './subscribe',
				exact: true,
				component: './ThongBao/Subscribe',
			},
			{
				path: './check',
				exact: true,
				component: './ThongBao/Check',
			},
			{
				path: './',
				exact: true,
				component: './ThongBao/NotifOneSignal',
			},
		],
		layout: false,
		hideInMenu: true,
	},
	{
		path: '/',
	},
	{
		path: '/403',
		component: './exception/403/403Page',
		layout: false,
	},
	{
		path: '/hold-on',
		component: './exception/DangCapNhat',
		layout: false,
	},
	{
		component: './exception/404',
	},
];
