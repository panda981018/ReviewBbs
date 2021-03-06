let myChart; // chart 객체를 가리킬 변수
let lookUpDate = 0; // 오늘 일자
let currMonth = 0; // 차트 조회 시점 달
let days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
let labels = []; // x축이 될 배열
let backgroundColors = [];

const CTX = document.getElementById('chart').getContext('2d');

function leapYear(year) { // 윤년 계산 함수
    if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) { // 윤년이면 2월은 29일까지
        days[1] = 29;
    } else {
        days[1] = 28;
    }
}

function setDate() { // 현재 기준 연도와 월
    const now = new Date();
    const year = now.getFullYear();
    let month;
    currMonth = now.getMonth() + 1;

    if (now.getDate() === 1) {
        month = now.getMonth();
        lookUpDate = days[month - 1];
    } else {
        month = now.getMonth() + 1;
        lookUpDate = now.getDate() - 1; // 오늘 일자의 배치 결과는 없으니 -1
    }

    leapYear(year);

    $('#yearSelect').val(year).prop('selected', true);
    $('#monthSelect').val(month).prop('selected', true);

    makeChart(year, month);
}

$('#monthSelect').on('change', function () {
    const year = $('#yearSelect option:selected').val();
    const month = $('#monthSelect option:selected').val();

    if (currMonth !== parseInt(month)) {
        lookUpDate = days[month - 1];
    } else {
        lookUpDate = new Date().getDate() - 1;
    }

    leapYear(year); // 윤년 체크

    if (parseInt(month) < 10) { // 01, 02, 03, ... 같이 두자리 아래의 달
        makeChart(year, parseInt(month));
    } else { // 10, 11, 12
        makeChart(year, month);
    }
});

// 차트를 그려주는 함수
function makeChart(year, month) {
    labels = []; // x축 초기화

    for (let i = 1; i <= lookUpDate; i++) {
        labels.push(`${year}-${month >= 10 ? month : '0' + month}-${i >= 10 ? i : '0' + i}`);
    }

    if (myChart !== undefined) {
        myChart.destroy();
    }

    $.ajax({
        method: 'GET',
        url: '/api/getData?year=' + year + '&month=' + month,
        dataType: "json",
        success: function (result) {
            const isZero = (currentValue) => currentValue === 0; // 현재 값이 0이라면 true 리턴
            let categoryValueArray = []; // 카테고리별 데이터 수를 담을 배열

            let dataSets = []; // 항목들에 대한 배열
            const batchResults = new Map(Object.entries(result)); // json을 map형태로 만듦
            const categoryList = Object.keys(result); // 카테고리명

            for (let i = 0; i < categoryList.length; i++) {
                const mapValue = batchResults.get(categoryList[i]);
                categoryValueArray.push(mapValue.length);
            }

            /**
             * data 형식 { // dataSets에 들어갈 항목
             *     label : 항목의 이름,
             *     data : 차트 레이블에 맞는 값 배열,
             *     backgroundColor : 채울 색깔,
             *     borderColor : 외각선 색깔
             * }
             *
             *
             * labels에 해당 달에 맞는 날짜들을 삽입해둔다.
             *
             */
            // 각 카테고리에 해당하는 자료가 없다면 = (카테고리 이름별 value의 length == 0)
            if (categoryValueArray.every(isZero)) {
                alert('해당 기간에 대한 통계 자료가 없습니다.');
            } else {
                for (let i = 0; i < categoryList.length; i++) {
                    let data = {};
                    let counts = []; // 카운트에 대한 배열
                    let mapValue = batchResults.get(categoryList[i]); // [날짜, 카운트]의 배열

                    for (let j = 0; j < lookUpDate; j++) {
                        counts.push(0);
                    }
                    for (let j = 0; j < mapValue.length; j++) {
                        if (labels.indexOf(mapValue[j][0]) !== -1) {
                            counts[labels.indexOf(mapValue[j][0])] = mapValue[j][1];
                        }
                    }
                    backgroundColors.push('#' + Math.round(Math.random() * 0xffffff).toString(16));

                    data.label = categoryList[i]; // 라인의 이름(항목)
                    data.backgroundColor = backgroundColors[i];
                    data.borderColor = backgroundColors[i];
                    data.data = counts;
                    dataSets.push(data);
                }
            }

            const data = {
                /**
                 * Array.from(arrayLike[, mapFn[, thisArg]]) : 매개변수에 오는 유사 배열 객체를 얕게 복사해 새로운 Array 객체를 만듦.
                 * arrayLike : 배열로 변환하고자 하는 유사 배열 객체 or 반복 가능한 객체
                 * mapFn(Optional) : 배열의 모든 요소에 대해 호출할 매핑 함수
                 * thisArg(Optional) : mapFn 실행 시에 this로 사용할 값.
                 */
                labels: Array.from(labels),
                datasets: dataSets
            };

            const config = {
                type: 'line',
                data: data,
                options: {
                    interaction: {
                        intersect: false,
                        mode: 'nearest'
                    },
                    scales: {
                        x: { // 레이블
                            display: true,
                            title: {
                                display: true,
                                text: 'Date',
                                color: 'rgb(0, 0, 0)',
                                padding: {top: 20, left: 0, right: 0, bottom: 15},
                                font: {
                                    family: 'Gothic',
                                    size: 20,
                                    weight: 'bold',
                                    lineHeight: 1.2
                                }
                            }
                        },
                        y: { // 세로축(여기서는 bbsCount)
                            suggestedMin: 0,
                            ticks: {
                                stepSize: 1
                            },
                            display: true,
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Count',
                                color: 'rgb(0, 0, 0)',
                                margin: {top: 30, left: 0, right: 0, bottom: 0},
                                font: {
                                    family: 'Gothic',
                                    size: 20,
                                    weight: 'bold',
                                    lineHeight: 1.2
                                }
                            }
                        }
                    }
                }
            };

            myChart = new Chart(
                CTX,
                config
            );
        }
    });
}