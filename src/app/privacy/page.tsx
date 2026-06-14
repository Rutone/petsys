export const metadata = { title: "Нууцлалын бодлого" };

export default function PrivacyPage() {
  return (
    <div className="prose-sm mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">Нууцлалын бодлого ба үйлчилгээний нөхцөл</h1>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">1. Цуглуулах мэдээлэл</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Энэхүү систем нь таны нэр, ШУТИС-ийн код (оюутны/багшийн/ажилтны), имэйл хаяг, сонгон оруулсан
          сургууль/тэнхимийн мэдээллийг бүртгэлд хадгална. Нууц үгийг шифрлэн (bcrypt) хадгалдаг тул хэн ч
          задлан харах боломжгүй.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">2. Мэдээллийн ашиглалт</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Таны мэдээллийг зөвхөн дараах зорилгоор ашиглана: хэрэглэгчийг таних, нэг хүн нэг л санал/гарын
          үсэг өгөх зарчмыг хангах, мэдэгдэл илгээх, систем хөгжүүлэх. Бид таны мэдээллийг гуравдагч этгээдэд
          худалдах, дамжуулахгүй.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">3. Саналын нууцлал</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Өргөдөлд гарын үсэг зурсан хүмүүсийн <strong>зөвхөн нийт тоо</strong> нийтэд харагдана — нэр харагдахгүй.
          Санал асуулгад өгсөн санал нь нэвтрэлтийн бүртгэлд хадгалагдах боловч маш нууц түвшинд хамгаалагдсан
          бөгөөд зөвхөн эрх бүхий админ хяналтын зорилгоор хандах боломжтой.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">4. Хэрэглэгчийн үүрэг</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Хэрэглэгч үнэн зөв мэдээлэл оруулах, бусдын нэр төр, эрхийг хүндэтгэх, доромжилсон болон хууль бус
          агуулга нийтлэхгүй байх үүрэгтэй. Дүрэм зөрчсөн тохиолдолд админ бүртгэлийг түр хаах эрхтэй.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">5. Бүртгэл устгах</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Хэрэглэгч өөрийн бүртгэлийг устгуулах эрхтэй. Бүртгэл устгаснаар таны үүсгэсэн өргөдөл, гарын үсэг,
          санал, сэтгэгдэл бүгд хамт устана.
        </p>
      </section>

      <p className="text-xs text-muted-foreground">
        Энэхүү бодлого нь ШУТИС-ийн Санал хураалын системийн анхны хувилбарт зориулагдсан бөгөөд цаашид
        шинэчлэгдэж болно.
      </p>
    </div>
  );
}
