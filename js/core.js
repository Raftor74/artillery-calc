//Типы снарядов
let ammoType = {
    "2b14": {
        "main":"Основной",
        "first":"1-й",
        "second":"2-й",
        "third":"3-й",
        "long":"Дальнобойный"
    }
};

$(document).ready(function(){

    $('#calculate-angle').click(function(){
        let data = calculate_angle();
        $('#result-angle').val(data);
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

    $('#close-alert').click(function(){
        closeAlert();
    });

    $('#result-сalc').click(function () {
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
    $('#wind-arrow').val(0);
    $('#result-angle').val(0);
}

//Очищает все поля формы дальности
function reloadRangeField() {
    $('#target-distance').val(0);
    $('#original-scope').val(0);
    $('#target-height').val(0);
    $('#cannon-height').val(0);
    $('#height-correction').val(0);
    $('#temperature').val(0);
    $('#pressure').val(0);
    $('#temperature-correction').val(0);
    $('#pressure-correction').val(0);
    $('#wind-correction').val(0);
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
    //Тип орудия
    let cannon_type = $('#cannon-type').val();
    //Тип снаряда
    let ammo_type = $('#ammo-type').val();

    distance = parseInt(distance);
    scope = parseInt(scope);
    target_height = parseInt(target_height);
    cannon_height = parseInt(cannon_height);
    height_correction = parseFloat(height_correction);
    temperature = parseFloat(temperature);
    pressure = parseFloat(pressure);
    temp_correction = parseFloat(temp_correction);
    pressure_correction = parseFloat(pressure_correction);

    //Получаем табличные значения по дальности
    let table_values = findNearestRangeValue(cannon_type, ammo_type, distance);

    //Поправка на ветер
    let wind_correction = parseFloat($('#wind-correction').val());

    //Если значения полученны выводим их
    if (table_values)
        table_values = reformatArray(table_values);
    else
        return false;

    if (!wind_correction){
        wind_correction = parseFloat(table_values["wind_correction"]);
        $('#wind-correction').val(wind_correction);
    }

    if (!scope){
        scope = parseInt(table_values["scope"]);
        $('#original-scope').val(scope);
    }

    if(!height_correction){
        height_correction = parseFloat(table_values["elev_correction"]);
        $('#height-correction').val(height_correction);
    }

    if(!temp_correction){
        temp_correction = parseFloat(table_values["temp_correction"]);
        $('#temperature-correction').val(temp_correction);
    }

    if(!pressure_correction){
        pressure_correction = parseFloat(table_values["pressure_correction"]);
        $('#pressure-correction').val(pressure_correction);
    }


    let result = scope + Math.round((target_height - cannon_height) / 100 * height_correction);
    result += Math.round((15 - temperature) * temp_correction);
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