import { DatasetItem } from "@/types/dataset";

export const INITIAL_DATASET: DatasetItem[] = [
  {
    id: "item_mam_101",
    text: "Ai đó có thể nói cho trọng tài biết bịt mắt không phải là một phần của trang bị điều khiển trận đấu chuẩn không? Tối nay chúng ta bị cướp trắng trợn! 😡⚽",
    mediaDescription: "Ảnh chụp màn hình buổi phát sóng thể thao cho thấy tình huống việt vị gây tranh cãi và quyết định phản đối của cầu thủ",
    media: {
      type: "image",
      url: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80",
      name: "tranh_cai_trong_tai.jpg",
      size: 482910,
      description: "Ảnh chụp màn hình buổi phát sóng thể thao cho thấy tình huống việt vị gây tranh cãi và quyết định phản đối của cầu thủ",
    },
    eval1: {
      label: "SAFE",
      note: "Bình luận bóng đá thông thường bộc lộ cảm xúc bức xúc của người hâm mộ, không mang từ ngữ thóa mạ hay quấy rối cá nhân.",
    },
    eval2: {
      label: "OFFENSIVE",
      note: "Buộc tội tiêu cực nhằm vào trọng tài điều khiển trận đấu, có xu hướng công kích cá nhân.",
    },
    createdAt: "2026-09-12T09:15:00.000Z",
  },
  {
    id: "item_mam_102",
    text: "Những người này lẽ ra không bao giờ được phép bước chân vào khu phố của chúng ta. Hãy trục xuất họ về nơi họ đến trước khi họ hủy hoại mọi thứ.",
    mediaDescription: "Bức ảnh chụp một buổi lễ hội giao lưu văn hóa cộng đồng hòa bình tại công viên địa phương",
    media: {
      type: "image",
      url: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1200&q=80",
      name: "le_hoi_cong_dong.jpg",
      size: 612400,
      description: "Bức ảnh chụp một buổi lễ hội giao lưu văn hóa cộng đồng hòa bình tại công viên địa phương",
    },
    eval1: {
      label: "HATE",
      note: "Ngôn từ kích động thù hận, bài ngoại nhắm vào cộng đồng người nhập cư/sắc tộc thiểu số kèm theo lời lẽ kỳ thị xua đuổi.",
    },
    eval2: {
      label: "HATE",
      note: "Phát ngôn mang tính bài xích rõ rệt và kỳ thị nhắm vào các thành viên cộng đồng thiểu số.",
    },
    createdAt: "2026-09-12T08:40:00.000Z",
  },
  {
    id: "item_mam_103",
    text: "Hình ảnh trực tiếp từ sự kiện công nghệ hôm nay! Thật sự là một bước tiến kinh ngạc trong robot tạo sinh và điều khiển xúc giác 🚀🤖",
    mediaDescription: "Đoạn clip video ngắn trình diễn cánh tay robot tương tác trong phòng thí nghiệm công nghệ",
    media: {
      type: "video",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      name: "robot_cong_nghe.mp4",
      size: 3200400,
      description: "Đoạn clip video ngắn trình diễn cánh tay robot tương tác trong phòng thí nghiệm công nghệ",
    },
    eval1: {
      label: "SAFE",
      note: "Nội dung chia sẻ tin tức công nghệ tích cực và hào hứng; tuân thủ hoàn toàn các tiêu chuẩn an toàn.",
    },
    eval2: {
      label: "SAFE",
      note: "Nội dung mang tính giáo dục và phổ biến kiến thức công nghệ hoàn toàn an toàn.",
    },
    createdAt: "2026-09-11T16:22:00.000Z",
  },
  {
    id: "item_mam_104",
    text: "Khi bạn vừa báo cáo với sếp là đã deploy xong xuôi nhưng máy chủ production lập tức bốc hỏa 🔥💀 #DevOpsLife",
    mediaDescription: "Hình ảnh meme vui nhộn về màn hình máy tính hiển thị các dòng log lỗi máy chủ nghiêm trọng",
    media: {
      type: "image",
      url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
      name: "meme_loi_server.jpg",
      size: 345100,
      description: "Hình ảnh meme vui nhộn về màn hình máy tính hiển thị các dòng log lỗi máy chủ nghiêm trọng",
    },
    eval1: {
      label: "SAFE",
      note: "Meme hài hước tự trào của giới lập trình viên; châm biếm nơi làm việc vô hại.",
    },
    eval2: {
      label: "SAFE",
      note: "Hình ảnh mang tính giải trí châm biếm, không chứa ý đồ thù địch hay gây hại tới bất kỳ nhóm đối tượng nào.",
    },
    createdAt: "2026-09-11T14:10:00.000Z",
  },
  {
    id: "item_mam_105",
    text: "Tin tức mới: Các cuộc thảo luận chính sách kinh tế đang diễn ra liên quan đến mức thuế suất thương mại xuyên biên giới.",
    mediaDescription: "Bục họp báo với đại diện các phái đoàn đàm phán chính sách kinh tế quốc gia",
    media: {
      type: "image",
      url: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80",
      name: "hop_bao_chinh_sach.jpg",
      size: 298400,
      description: "Bục họp báo với đại diện các phái đoàn đàm phán chính sách kinh tế quốc gia",
    },
    eval1: {
      label: null,
      note: "",
    },
    eval2: {
      label: null,
      note: "",
    },
    createdAt: "2026-09-11T11:00:00.000Z",
  },
];
