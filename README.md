# Interior Design API Server

Bu API, yapay zeka ile iç mekan tasarımı oluşturmak için kullanılır.

## Kurulum

1. Gerekli paketleri yükleyin:

```
npm install
```

2. `.env.example` dosyasını kopyalayıp `.env` olarak yeniden adlandırın ve Replicate API anahtarınızı ekleyin:

```
cp .env.example .env
```

3. `.env` dosyasını düzenleyerek `REPLICATE_API_TOKEN` değerini [Replicate](https://replicate.com) hesabınızdan alacağınız API anahtarı ile değiştirin.

## Çalıştırma

Geliştirme modunda çalıştırmak için:

```
npm run dev
```

Üretim modunda çalıştırmak için:

```
npm start
```

## API Kullanımı

### İç Mekan Tasarımı Oluşturma

**Endpoint:** `POST /api/generate-interior`

**Form-data Parametreleri:**

- `image`: Orijinal oda görüntüsü (dosya)
- `mask`: Maskelenmiş görüntü (dosya)
- `prompt`: Tasarım açıklaması (metin)
- `steps`: İşlem adımları (varsayılan: 50)
- `guidance`: Yönlendirme kuvveti (varsayılan: 60)
- `outpaint`: Dışa boyama modu (varsayılan: "None")
- `safety_tolerance`: Güvenlik toleransı (varsayılan: 2)
- `prompt_upsampling`: Prompt üst örnekleme (varsayılan: false)

**Örnek Yanıt:**

```json
{
  "success": true,
  "data": {
    "generated_image_url": "https://replicate.delivery/pbxt/...",
    "original_parameters": {
      "mask": "http://localhost:5000/uploads/1234-mask.png",
      "image": "http://localhost:5000/uploads/1234-room.png",
      "steps": 50,
      "prompt": "Modern, bright living room...",
      "guidance": 60,
      "outpaint": "None",
      "output_format": "jpg",
      "safety_tolerance": 2,
      "prompt_upsampling": false
    }
  }
}
```
