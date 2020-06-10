'use strict';

// シャッターボタンを制御する値t
let t = 0;
let index = true;


// canvasのURLを所得する関数
const changeImage = (canvas) => {
  const png = canvas.toDataURL('image/png', 0.1);
  return png;
};

    // ローカルストレージに保存
    $('select').on('change', function() {
       const type = $(this).val();
      localStorage.setItem('type', type);
    });

// 顔を検出して画像を重ね合わせる関数
let imgLoad = function (source, ctx) {
  // 写真の取り込み
  const image = new Image();
  image.src = source;
  image.onload = function () {
    // 顔の検出
    var face_info = ccv.detect_objects({
      "canvas": ccv.grayscale(ccv.pre(image)),
      "cascade": cascade,
      "interval": 5,
      "min_neighbors": 1,
    });

    // 送られてきた画像のデータをcanvas に表示
    ctx.drawImage(image, 0, 0);

    // 貼り付ける画像(png)とそれぞれにあった地点(x,y,w,h)を修正
    let g = $('[name=items]').val();


    let png;
    let x, y, w, h;
    if (g == 1) {
      png = "./images/megane.png";
      x = -15, y = 20, w = 30, h = -50;
    } else if (g == 2) {
      png = "./images/hanamegane.png";
      x = -15, y = 30, w = 30, h = -50;
    } else if (g == 3) {
      png = "./images/sunglass.png";
      x = -10, y = 15, w = 30, h = -50;
    } else if (g == 4) {
      png = "./images/hartglass.png";
      x = -10, y = 15, w = 30, h = -50;
    } else if (g == 5) {
      png = "./images/niko.png";
      x = -20, y = -30, w = 20, h = 50;
    } 
    // メガネ画像を重ねる
    const glassImage = new Image();
    glassImage.src = png;
    glassImage.onload = function () {
      for (var i = 0; i < face_info.length; i++) {
        ctx.drawImage(glassImage, face_info[i].x + x, face_info[i].y + y, face_info[i].width + w, face_info[i].height + h);
      }
    }
    if (face_info.length === 0) {
      alert('顔認識できませんでした');
      alert('載せたい画像の最大サイズよ大きく表示されているかも知れません！');
      t--;
    }
  };
}

$('#change_btn').on('click', function () {
  index = !index;
  $('.photo').toggleClass('not_use');
  $('.not_use').css('display', 'none');
  $('.photo').toggleClass('use');
  $('.use').css('display', 'block');
  if (index) {
    $('#style').html("撮影ver(この場で撮影します)");
    $('.shutter').attr('able');
  } else {
    $('#style').html("ドロップダウンver(画像をファイルよりドロップダウンしてください)");
    $('.shutter').attr('disable');
  }
})

window.onload = () => {
  console.log(t);
  const video = document.querySelector("#camera");
  const picture = document.querySelector('#picture');
  let ctx = picture.getContext('2d');
  const se = document.querySelector('#se');

  //3.ページ読み込み：保存データ取得表示
  if (localStorage.getItem('type')) {
    const type = localStorage.getItem('type');
    $('select').val(type);
  };

  // カメラ設定
  const constraints = {
    audio: false,
    video: {
      width: 640,
      height: 480,
      facingMode: "user" //フロントカメラを利用する
      // facingMode: {exact: "environment"} //リアカメラを利用する
    }
  };

  // カメラを<video></video>と同期
  navigator.mediaDevices.getUserMedia(constraints)
    .then((stream) => {
      video.srcObject = stream;
      video.onloadedmetadata = (e) => {
        video.play();
      };
    })
    .catch((err) => {
      console.log(err.name + ":" + err.message);
    });


  $(function () {
    // ドロップされた画像を反映
    $('#drop').on({
      'drop': function (e) {
        var pic = new Image();
        var f = e.originalEvent.dataTransfer.files[0];
        var reader = new FileReader();
        $(reader).on('load', function () {
          $('#dropped').attr('src', reader.result);
          // この画像を使用する
          pic.src = reader.result;
        });

        setTimeout(function () { imgLoad(pic.src, ctx); }, 500);

        reader.readAsDataURL(f);
        e.preventDefault();
        t++;
      },
      'dragover': function (e) {
        e.preventDefault();
      }
    });
  });

  // シャッターボタン
  document.querySelector('#shutter').addEventListener('click', () => {
    if (t === 0) {
      if (index) {
        let png;
        // 映像を止めてSEを再生する
        video.pause();  //映像を停止
        se.play(); //シャッター音
        setTimeout(() => {
          video.play();  //0.5秒後にカメラ再開
        }, 500);

        // pictureに画像を貼り付ける
        ctx.drawImage(video, 0, 0, picture.width, picture.height);

        // ctxt.drawImage(video, 0, 0, picture.width, picture.height);
        // pictureのバイナリURLをとる
        png = changeImage(picture);

        // else if(index === false){
        // }

        // canvasに顔認証して，メガネを表示させる関数に送る
        imgLoad(png, ctx);
        t++;
      }

    } else {
      // 撮り直し
      if (window.confirm("画像変換のため，リロードします")) {
        location.reload();
      };
    }
  });
};