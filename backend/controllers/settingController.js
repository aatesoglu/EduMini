const { Setting } = require('../models');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Tüm ayarları getir
exports.getAllSettings = catchAsync(async (req, res, next) => {
    const settings = await Setting.findAll();

    // Dizi formatından Key-Value objesine dönüştür
    const settingsObj = {};
    settings.forEach(s => {
        settingsObj[s.key] = s.value;
    });

    res.status(200).json({
        status: 'success',
        data: settingsObj
    });
});

// Ayarları güncelle (yoksa oluştur)
exports.updateSettings = catchAsync(async (req, res, next) => {
    const settingsData = req.body; // { email: '...', phone: '...' }

    const keys = Object.keys(settingsData);

    const promises = keys.map(key => {
        return Setting.upsert({
            key: key,
            value: settingsData[key]
        });
    });

    await Promise.all(promises);

    res.status(200).json({
        status: 'success',
        message: 'Ayarlar güncellendi'
    });
});
