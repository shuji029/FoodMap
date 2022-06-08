mapboxgl.accessToken = 'pk.eyJ1IjoiMTkwMDY3NSIsImEiOiJja3Z1YW9tcTIzbXdqMndxZ3hwNjNubzdsIn0.tRXlsEUMAf9dc94qhYeYog';
const map = new mapboxgl.Map({
	container: 'map', // container id
	style: 'mapbox://styles/mapbox/streets-v11',
	center: [136.66240338447, 36.562140121241],
	zoom: 17 // starting zoom
});

mapboxgl.setRTLTextPlugin('https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.2.3/mapbox-gl-rtl-text.js');
map.addControl(new MapboxLanguage({
	defaultLanguage: 'ja'
}));

window.onload = () => {
	function $(id) { return document.getElementById(id); }
	let header_ul_distance = $("distance");
	let header_ul_shop_type = $("shop_type");
	let header_ul_open_time = $("open_time");

	let distance = "3";     // 1=300m, 2=500m, 3=1000m, 4=2000m, 5=3000m
	let shop_type = "G001"; // G0 + 01=居酒屋, 02=ダイニングバー, 03=創作料理, 04=和食, 05=洋食, 06=イタリアン・フレンチ
	// 07=中華, 08=焼肉, 17=韓国料理, 09=アジア・エスニック料理, 10=各国料理, 
	// 11=カラオケ・パーティ, 12=バー・カクテル, 13=ラーメン, 16=お好み焼き
	// 14=カフェ・スイーツ, 15=その他グルメ
	let open_time = "0";    // 0=絞り込まない, 1=絞り込む

	// 初期値は兼六園のはず
	let lat = 36.562140121241; // 緯度
	let lng = 136.66240338447; // 経度

	let now_distance = $("now_distance");
	let now_shop_type = $("now_shop_type");;
	let now_open_time = $("now_open_time");;

	// アイコン接地用のオブジェクトを用意する
	/*
	let kenrokuen = {
		'type': 'Feature',
		'properties': {
			'description':
				'<strong>兼六園</strong><p><a href="http://www.pref.ishikawa.jp/siro-niwa/kenrokuen/" target="_blank" title="新しいタブで開きます">ホームページ </a></p>',
			'icon': 'park'
	
		},
		'geometry': {
			'type': 'Point',
			'coordinates': [136.66240338447, 36.5618]
		}
	}
	let kanazawaeki = {
		'type': 'Feature',
		'properties': {
			'description':
				'<strong>金沢駅</strong><p><a href="https://www.kanazawa-kankoukyoukai.or.jp/spot/detail_10050.html" target="_blank" title="新しいタブで開きます">鼓門が出迎えます </a></p>',
			'icon': 'rail'
		},
		'geometry': {
			'type': 'Point',
			'coordinates': [136.649260, 36.5775]
		}
	}
	let kodai = {
		'type': 'Feature',
		'properties': {
			'description':
				'<strong>工大</strong><p>私の大学です<a href="https://www.kanazawa-it.ac.jp/" target="_blank" title="新しいタブで開きます">詳細はこちら</a></p>',
			'icon': 'college'
		},
		'geometry': {
			'type': 'Point',
			'coordinates': [136.6282672, 36.5286532]
		}
	}
	*/

	// 取得したデータを格納するもの
	// let datas = new Array();
	let icons = new Array();
	get_now_Position();

	// getData_Testより　---------------------------------------------------- ↓↓↓
	let button = $('button');
	let API_KEY = "a34c64e715f631a6";


	button.addEventListener('click', () => {
		let url = "https://webservice.recruit.co.jp/hotpepper/gourmet/v1/?key=" + API_KEY + "&lat=" + lat + "&lng=" + lng +
			"&range=" + distance + "&genre=" + shop_type + "&midnight_meal=" + open_time + "&format=json";
		console.log(url);

		httpGet(url);
		remake_map();
	});

	// 郵便番号から住所検索
	function httpGet(url) { //通信の内容
		const xhr = new XMLHttpRequest();
		xhr.open('GET', url, true); // HTTPリクエストの初期化
		xhr.onreadystatechange = () => { // 通信の状態が変化したときに呼び出される処理を定義
			if (xhr.readyState == 4) { // 4: すべての応答データを取得済み
				if (xhr.status == 200) { // 200: OK(処理成功）
					const data = JSON.parse(xhr.responseText); // JSON形式の文字列をJavaScritオブジェクトへ変換
					if (!data.results) {
						//$("address").innerHTML = ""; //　検索結果欄をクリア
						address.innerHTML =
							alert("該当する住所はありませんでした");
					}
					else {
						setData(data);
					}
				}
				else {
					console.log(xhr.status); //処理が成功しない場合のステータス
				}
			}
			else {
				// $("address").innerHTML = "通信中....."; // すべてのデータを取得できていない場合
				console.log("通信中....");
			}
		};
		// xhr.responseType = "text/json";
		xhr.send(''); // HTTPリクエストを送信、その後、
		//通信状態が変化するたびにonreadystatechangeイベントが発生
	}

	function setData(data) {
		// $("address").innerHTML = "";
		icons = [];

		// 自分の位置を追加する
		icons.push({
			'type': 'Feature',
			'properties': {
				'description':
					'<strong>現在地</strong><p><a target="_blank" title="新しいタブで開きます"></a></p>',
				'icon': 'religious-jewish'

			},
			'geometry': {
				'type': 'Point',
				'coordinates': [lng, lat]
			}
		});

		for (let shop of data.results.shop) {
			// $("address").innerHTML += shop.name + ":" + shop.name_kana + ":" + shop.lat + ":" + shop.lng; //住所を取得
			// $("address").innerHTML += "/";

			icons.push({
				'type': 'Feature',
				'properties': {
					'description':
						'<strong>' + shop.name + '</strong><p><a target="_blank" title="新しいタブで開きます">' + shop.name_kana + '</a></p>',
					'icon': 'restaurant'

				},
				'geometry': {
					'type': 'Point',
					'coordinates': [shop.lng, shop.lat]
				}
			});
		}
		console.log(icons);

		
	}

	// ---------------------------------------------------------------------- ↑↑↑

	// function ShowData() {
	//	console.log("距離:" + distance + "/ ジャンル:" + shop_type + "/ 深夜:" + open_time);
	// }

	// 距離のリストにイベントを付与する = distanceに値を入れる
	for (let i = 0; i < header_ul_distance.childElementCount; i++) {
		header_ul_distance.children[i].addEventListener("click", () => {
			distance = header_ul_distance.children[i].value;
			switch (distance) {
				case 1: now_distance.innerHTML = "300M"; break;
				case 2: now_distance.innerHTML = "500M"; break;
				case 3: now_distance.innerHTML = "1000M"; break;
				case 4: now_distance.innerHTML = "2000M"; break;
				case 5: now_distance.innerHTML = "3000M"; break;
				default: console.log(distance);
			}
			// ShowData();
		});
	}

	// お店のジャンルのリストにイベントを付与する = shop_typeに値を入れる
	for (let i = 0; i < header_ul_shop_type.childElementCount; i++) {
		header_ul_shop_type.children[i].addEventListener("click", () => {
			let tmpString = "";
			// htmlのliのvalueには、数値しか入れれなかったので、ここで調整する
			if (header_ul_shop_type.children[i].value < 10) {
				// 数値が一桁なら、「G00」を後ろに付ける
				tmpString += "G00" + header_ul_shop_type.children[i].value
			}
			else {
				// 数値が2桁なら、「G0」を後ろにつける
				tmpString += "G0" + header_ul_shop_type.children[i].value
			}
			shop_type = tmpString;
			switch (shop_type) {
				case "G001": now_shop_type.innerHTML = "居酒屋"; break;
				case "G002": now_shop_type.innerHTML = "ダイニングバー"; break;
				case "G003": now_shop_type.innerHTML = "創作料理"; break;
				case "G004": now_shop_type.innerHTML = "和食"; break;
				case "G005": now_shop_type.innerHTML = "洋食"; break;
				case "G006": now_shop_type.innerHTML = "イタリアン・フレンチ"; break;
				case "G007": now_shop_type.innerHTML = "中華"; break;
				case "G008": now_shop_type.innerHTML = "焼肉"; break;
				case "G009": now_shop_type.innerHTML = "アジア・エスニック料理"; break;
				case "G010": now_shop_type.innerHTML = "各国料理"; break;
				case "G011": now_shop_type.innerHTML = "カラオケ・パーティ"; break;
				case "G012": now_shop_type.innerHTML = "バー・カクテル"; break;
				case "G013": now_shop_type.innerHTML = "ラーメン"; break;
				case "G014": now_shop_type.innerHTML = "カフェ・スイーツ"; break;
				case "G015": now_shop_type.innerHTML = "その他のグルメ"; break;
				case "G016": now_shop_type.innerHTML = "お好み焼き"; break;
				case "G017": now_shop_type.innerHTML = "韓国料理"; break;
				default: console.log(shop_type);
			}
			// ShowData();
		});
	}

	//  深夜営業のリストにイベントを付与する = open_timeに値を入れる 
	for (let i = 0; i < header_ul_open_time.childElementCount; i++) {
		header_ul_open_time.children[i].addEventListener("click", () => {
			open_time = header_ul_open_time.children[i].value;
			switch (open_time) {
				case 0: now_open_time.innerHTML = "指定なし"; break;
				case 1: now_open_time.innerHTML = "深夜(23時以降)"; break;
				default: console.log(open_time);
			}
			// ShowData();
		});
	}

	function get_now_Position() {
		navigator.geolocation.getCurrentPosition(geoSuccess, geoError);
		//　位置取得に成功したとき
		function geoSuccess(event) {
			lat = event.coords["latitude"];
			lng = event.coords["longitude"];
			map.flyTo({ center: [lng, lat] });
		}
		// 位置取得に失敗したとき
		function geoError(event) {
			alert("位置取得失敗:" + event.code);
		}
	}

	// アイコンを更新するために、再度マップを描画する
	function remake_map() {
		const map = new mapboxgl.Map({
			container: 'map', // container id
			style: 'mapbox://styles/mapbox/streets-v11',
			center: [lng,lat],
			zoom: 17 // starting zoom
		});
		map.addControl(new MapboxLanguage({
			defaultLanguage: 'ja'
		}));


		map.on('load', () => {
			map.addSource('places', {
				'type': 'geojson',
				'data': {
					'type': 'FeatureCollection',
					'features': icons
				}
			});
			// アイコンの場所を示すレイヤーを追加
			map.addLayer({
				'id': 'places',
				'type': 'symbol',
				'source': 'places',
				'layout': {
					'icon-image': '{icon}-15',
					'icon-allow-overlap': true
				}
			});

			// 設定したアイコンをクリックするとそれに関するポップアップが表示される
			map.on('click', 'places', function (e) {
				const coordinates = e.features[0].geometry.coordinates.slice();
				const description = e.features[0].properties.description;

				new mapboxgl.Popup()
					.setLngLat(coordinates)
					.setHTML(description)
					.addTo(map);
			});

			// マウスが設定したアイコンにオーバーラップするとマウスはポインタ表示になる。
			map.on('mouseenter', 'places', function () {
				map.getCanvas().style.cursor = 'pointer';
			});

			// 設定したアイコンから離れるともとに戻る
			map.on('mouseleave', 'places', function () {
				map.getCanvas().style.cursor = '';
			});
		});
	}
}    