let ammoType = {
    "2b14": {
        "main":"Основной",
        "first":"1-й",
        "second":"2-й",
        "third":"3-й",
        "long":"Дальнобойный"
    },
    "d30":0,
    "2c3":0,
    "bm21":0
};

$(document).ready(function(){

    $('#calculate-angle').click(function(){
        calculate_angle();
        return false;
    });

    $('.clear-if-zero').click(function () {
        let object = $(this);
        object.val("");
    });

    $('#ammo-type').ready(function () {
        let cannonType = $('#cannon-type').val();
        loadAmmoType(cannonType);
    });

    $('#cannon-type').change(function () {
        let cannonType = $(this).val();
        loadAmmoType(cannonType);
    });
    
    $('#result-сalc').click(function () {
        calculateScope();
        return false;
    });

});

//Загружает типы снарядов для орудий
function loadAmmoType(cannonType) {

    let ammo = ammoType[cannonType];
    let object = $('#ammo-type');
    object.empty();
    if (ammo){
        for (let item in ammo)
        {
            let option = '<option value="' + item + '">' + ammo[item] + '</option>';
            object.append(option);
        }
    }
}

//Рассчитывает прицел
function calculateScope() {
    //Дистанция до цели
    let distance = $('#target-distance').val();
    //Исходный прицел
    let scope = $('#original-scope').val();
    //Высота цели
    let target_height = $('#target-height').val();
    //Высота орудия
    let cannon_height = $('#cannon-height').val();
    //Поправка на высоту
    let height_correction = $('#height-correction').val();
    //Температура
    let temperature = $('#temperature').val();
    //Давление
    let pressure = $('#pressure').val();
    //Поправка на температуру
    let temp_correction = $('#temperature-correction').val();
    //Поправка на давление
    let pressure_correction = $('#pressure-correction').val();

    distance = parseInt(distance);
    scope = parseInt(scope);
    target_height = parseInt(target_height);
    cannon_height = parseInt(cannon_height);
    height_correction = parseFloat(height_correction);
    temperature = parseFloat(temperature);
    pressure = parseFloat(pressure);
    temp_correction = parseFloat(temp_correction);
    pressure_correction = parseFloat(pressure_correction);

    let result = scope + Math.round((target_height - cannon_height) / 100 * height_correction);
    result += Math.round((15 - temperature) * temp_correction) + Math.round((pressure - 1013)*pressure_correction);
    $('#result-scope').val(result);
}

//Рассчитывает значение угломера
function calculate_angle() {
    let target_angle = $('#target-angle').val();
    let focus_angle = $('#focus-angle').val();
    let invert_target_angle = $('#invert-target-angle').prop('checked');
    let invert_focus_angle = $('#invert-focus-angle').prop('checked');
    let wind_speed = $('#wind-speed').val();
    let wind_arrow = $('#wind-arrow').val();
    let wind_correction = $('#wind-correction').val();
    let result = 3000;

    target_angle = parseInt(target_angle);
    focus_angle = parseInt(focus_angle);
    wind_speed = parseFloat(wind_speed);
    wind_arrow = parseFloat(wind_arrow);
    wind_correction = parseFloat(wind_correction);

    if (invert_focus_angle) {
        focus_angle = Math.round(focus_angle * 6000 / 6400);
    }

    if (invert_target_angle) {
        target_angle = Math.round(target_angle * 6000 / 6400);
    }

    let wind_result = ((wind_speed / 4) * wind_correction) * wind_arrow;

    result = result + (target_angle - focus_angle) + wind_result;

    $('#result-angle').val(result);

}