"use client";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDots,
  Check,
  Clock,
  Leaf,
} from "@phosphor-icons/react";
import { RecipeBrowser } from "@/components/recipes";
import { useStore } from "@/components/store";

export default function Home() {
  const { plan, user } = useStore();
  const planned = Object.keys(plan).length;
  return (
    <>
      <div className="page-heading home-heading">
        <div>
          <p className="greeting">
            {user
              ? "Chào " + user.name + ", hôm nay mình nấu gì?"
              : "Bữa cơm nhà, nhẹ nhàng hơn"}
          </p>
          <h1>Món Việt quen. Khẩu vị riêng.</h1>
          <p className="heading-description">
            Chọn món, biến tấu theo ý bạn. MealMate gom nguyên liệu để bạn đi
            chợ.
          </p>
        </div>
        <Link href="/meal-plan" className="button secondary">
          <CalendarDots size={20} /> Kế hoạch tuần
        </Link>
      </div>
      <section className="hero" aria-labelledby="featured-recipe-heading">
        <div className="hero-copy">
          <span className="hero-eyebrow">
            <Leaf size={18} /> MỘT MÓN CƠM NHÀ
          </span>
          <h2 id="featured-recipe-heading">
            Một nồi thịt kho.
            <br />
            <em>Một bữa cơm ấm.</em>
          </h2>
          <p>
            Thịt mềm, trứng bùi, nước kho đậm đà. Thêm bát cơm nóng, rồi chỉnh
            chút ngọt mặn cho đúng vị nhà mình.
          </p>
          <div className="hero-actions">
            <Link href="/recipes/thit-kho-trung" className="button primary">
              Xem cách nấu <ArrowRight size={20} />
            </Link>
            <Link href="/recipes/new" className="text-link">
              Thêm món của tôi <ArrowUpRight size={18} />
            </Link>
          </div>
        </div>
        <Link
          href="/recipes/thit-kho-trung"
          className="hero-visual"
          aria-label="Xem công thức thịt kho trứng"
        >
          <img
            className="hero-image"
            src="/images/thit-kho-trung.png"
            alt="Nồi thịt kho trứng bên bát cơm nóng"
            fetchPriority="high"
          />
          <span className="hero-sticker">
            <Clock size={18} /> 65 phút · cơm nhà
          </span>
          <div className="hero-recipe">
            <div>
              <strong>Thịt kho trứng</strong>
              <span>Quen thuộc, dễ biến tấu.</span>
            </div>
            <span className="hero-recipe-arrow">
              <ArrowUpRight size={22} />
            </span>
          </div>
        </Link>
      </section>
      <div className="week-banner">
        <span className="week-banner-icon">
          <CalendarDots size={25} />
        </span>
        <div>
          <strong>
            {planned
              ? planned + " bữa đã lên lịch. Bớt một việc phải nghĩ."
              : "Lên vài bữa trước. Đi chợ nhẹ đầu hơn."}
          </strong>
          <p>
            {planned
              ? "Thêm món bạn thích, rồi tạo danh sách đi chợ từ kế hoạch."
              : "Bắt đầu từ một món bạn muốn ăn. Không cần lên lịch kín cả tuần."}
          </p>
        </div>
        <div
          className="week-progress"
          aria-label={planned + " of seven days planned"}
        >
          {Array.from({ length: 7 }, (_, i) => (
            <span key={i} className={i < planned ? "filled" : ""}>
              {i < planned && <Check size={13} weight="bold" />}
            </span>
          ))}
        </div>
        <Link href="/meal-plan" className="text-link">
          {planned ? "Xem kế hoạch" : "Chọn một bữa"}
          <ArrowRight size={18} />
        </Link>
      </div>
      <RecipeBrowser compact />
      <div className="pantry-prompt">
        <span>
          <Leaf size={21} /> Xem bếp còn gì trước khi đi chợ.
        </span>
        <Link href="/pantry">
          Ghi lại đồ có sẵn <ArrowUpRight size={18} />
        </Link>
      </div>
    </>
  );
}
