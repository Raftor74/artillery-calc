//Типы снарядов
let ammoType = {
    "2b14": {
        "main":"Основной",
        "first":"1-й",
        "second":"2-й",
        "third":"3-й",
        "long":"Дальнобойный"
    },
    "d30": {
        "fourth": "4-й",
        "third" : "3-й",
        "second": "2-й",
        "first": "1-й",
        "small": "Уменьшеный",
        "full": "Полный",
        "full_dir" : "Полный (прям)"
    },
    "2c3": {
        "single1" : "Single 1",
        "single2" : "Single 2",
        "single3" : "Single 3",
    },
    "bm21": {
        "close": "Close"
    }
};

$(document).ready(function(){

    $('#calculate-angle').click(function(){
        let data = calculate_angle();
        $('#result-angle').val(data);
        return false;
    });

    $('.selectable').focus(function () {
        $(this).select();
    });

    $('#ammo-type').ready(function () {
        let cannonType = $('#cannon-type').val();
        let ammoTypes = loadAmmoType(cannonType);
        let ammoName = ammoTypes[0];
        let minMax = uploadMinMaxRange(cannonType, ammoName);
        setMinMaxRange(minMax);
    });

    $('#cannon-type').change(function () {
        let cannonType = $(this).val();
        let ammoTypes = loadAmmoType(cannonType);
        let ammoName = ammoTypes[0];
        let minMax = uploadMinMaxRange(cannonType, ammoName);
        setMinMaxRange(minMax);
    });

    $('#ammo-type').change(function () {
        let cannonType = $('#cannon-type').val();
        let ammoName = $(this).val();
        let minMax = uploadMinMaxRange(cannonType, ammoName);
        setMinMaxRange(minMax);
    });

    $('#close-alert').click(function(){
        closeAlert();
    });

    $('#result-сalc').click(function () {
        closeAlert();
        let data = calculateScope();
        if (data)
            $('#result-scope').val(data);
        else
            displayError("Выбран неподходящий тип снаряда");
        return false;
    });

    $('#reset').click(function () {
        reloadRangeField();
        return false;
    });

    $('#reset-angle').click(function () {
        reloadAngleField();
        return false;
    });

});

function setMinMaxRange(minMaxArray) {
    if (minMaxArray) {
        $('#min-ammo-range').val(minMaxArray[0]);
        $('#max-ammo-range').val(minMaxArray[1]);
    } else {
        return false;
    }
}

function uploadMinMaxRange(cannon_type, ammo_name) {
    let ranges = getCannonTableArray(cannon_type, ammo_name);
    let minMaxArray = getMinMaxRange(ranges);
    return minMaxArray;
}

function closeAlert() {
    $('#error-text').empty();
    $('#error-message-block').hide();
}

//Очищает все поля формы угломера
function reloadAngleField() {
    $('#wind-correction').val(0);
    $('#target-angle').val(0);
    $('#focus-angle').val(0);
    $('#invert-target-angle').prop('checked',false);
    $('#invert-focus-angle').prop('checked', false);
    $('#wind-speed').val(0);
    $('#result-angle').val(0);
}

//Очищает все поля формы дальности
function reloadRangeField() {
    $('#target-distance').val(0);
    $('#original-scope').val(0);
    $('#target-height').val(0);
    $('#cannon-height').val(0);
    $('#height-correction').val(0);
    $('#temperature-correction').val(0);
    $('#pressure-correction').val(0);
    $('#wind-correction').val(0);
    $('#result-scope').val(0);
    closeAlert();
}

function displayError(text){
    let errorObj = $('#error-message-block');
    let errorText = $('#error-text');
    errorText.html(text);
    errorObj.show();
}

//Загружает типы снарядов для орудий
function loadAmmoType(cannonType) {

    let ammo = ammoType[cannonType];
    let ammoValues = [];
    let object = $('#ammo-type');
    object.empty();
    if (ammo){
        for (let item in ammo)
        {
            ammoValues.push(item);
            let option = '<option value="' + item + '">' + ammo[item] + '</option>';
            object.append(option);
        }
    }

    return ammoValues;
}

//Рассчитывает прицел
function calculateScope() {
    //Дистанция до цели
    let distance = $('#target-distance').val();
    //Высота цели
    let target_height = $('#target-height').val();
    //Высота орудия
    let cannon_height = $('#cannon-height').val();
    //Температура
    let temperature = $('#temperature').val();
    //Давление
    let pressure = $('#pressure').val();
    //Тип орудия
    let cannon_type = $('#cannon-type').val();
    //Тип снаряда
    let ammo_type = $('#ammo-type').val();

    distance = parseInt(distance);
    target_height = parseInt(target_height);
    cannon_height = parseInt(cannon_height);
    temperature = parseFloat(temperature);
    pressure = parseFloat(pressure);

    //Получаем табличные значения по дальности
    let table_values = findNearestRangeValue(cannon_type, ammo_type, distance);

    //Если значения полученны выводим их
    if (table_values)
        table_values = reformatArray(table_values);
    else
        return false;

    //Табличная поправка на ветер
    let wind_correction = parseFloat(table_values["wind_correction"]);
    $('#wind-correction').val(wind_correction);
    //Табличный прицел
    let scope = parseInt(table_values["scope"]);
    $('#original-scope').val(scope);
    //Табличная поправка на высоту
    let height_correction = parseFloat(table_values["elev_correction"]);
    $('#height-correction').val(height_correction);
    //Табличная поправка на температуру
    let temp_correction = parseFloat(table_values["temp_correction"]);
    $('#temperature-correction').val(temp_correction);
    //Табличная поправка на давление
    let pressure_correction = parseFloat(table_values["pressure_correction"]);
    $('#pressure-correction').val(pressure_correction);

    //Считаем прицел с учётом поправки на высоты
    let result = scope - Math.round((target_height - cannon_height) / 100 * height_correction);
    //Считаем прицел с учётом поправки на температуру
    result += Math.round((15 - temperature) * temp_correction);
    //Считаем прицел с учётом поправки на давление
    if (pressure)
        result += + Math.round((pressure - 1013)*pressure_correction);

    return result;
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
    result = Math.round(result);

    return result;
}