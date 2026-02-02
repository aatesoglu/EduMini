const { Announcement } = require('../models');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAllAnnouncements = catchAsync(async (req, res, next) => {
    const announcements = await Announcement.findAll({
        where: { active: true },
        order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
        status: 'success',
        results: announcements.length,
        data: {
            announcements
        }
    });
});

exports.getAnnouncement = catchAsync(async (req, res, next) => {
    const announcement = await Announcement.findByPk(req.params.id);

    if (!announcement || !announcement.active) {
        return next(new AppError('Duyuru bulunamadı', 404));
    }

    res.status(200).json({
        status: 'success',
        data: { announcement }
    });
});

exports.getAllAnnouncementsAdmin = catchAsync(async (req, res, next) => {
    console.log('Admin announcements request received');
    const announcements = await Announcement.findAll({
        order: [['createdAt', 'DESC']]
    });
    console.log(`Found ${announcements.length} announcements for admin`);

    res.status(200).json({
        status: 'success',
        results: announcements.length,
        data: {
            announcements
        }
    });
});

exports.createAnnouncement = catchAsync(async (req, res, next) => {
    try {
        // Log the incoming request for debugging
        console.log('Request body:', req.body);
        console.log('Request file:', req.file);

        // Create announcement data object
        const announcementData = {
            title: req.body.title,
            content: req.body.content,
            type: req.body.type || 'announcement',
            active: req.body.active !== 'false', // Convert string to boolean
        };

        // Add image path if file was uploaded
        if (req.file) {
            announcementData.image = `/img/announcements/${req.file.filename}`;
        } else {
            return next(new AppError('Lütfen bir resim yükleyin', 400));
        }

        console.log('Creating announcement with data:', announcementData);

        const newAnnouncement = await Announcement.create(announcementData);

        res.status(201).json({
            status: 'success',
            data: {
                announcement: newAnnouncement
            }
        });
    } catch (error) {
        console.error('Error creating announcement:', error);
        next(error);
    }
});

exports.updateAnnouncement = catchAsync(async (req, res, next) => {
    try {
        const announcement = await Announcement.findByPk(req.params.id);

        if (!announcement) {
            return next(new AppError('Bu ID ile duyuru bulunamadı', 404));
        }

        // Create update data object
        const updateData = {
            title: req.body.title,
            content: req.body.content,
            type: req.body.type || announcement.type,
            active: req.body.active === 'true' || req.body.active === true
        };

        // Update image if a new file was uploaded
        if (req.file) {
            updateData.image = `/img/announcements/${req.file.filename}`;

            // Optionally delete the old image file if it exists
            if (announcement.image) {
                const fs = require('fs');
                const path = require('path');
                const oldImagePath = path.join('public', announcement.image);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlink(oldImagePath, (err) => {
                        if (err) console.error('Error deleting old image:', err);
                    });
                }
            }
        }

        console.log('Updating announcement with data:', updateData);
        await announcement.update(updateData);

        // Fetch the updated announcement
        const updatedAnnouncement = await Announcement.findByPk(req.params.id);

        res.status(200).json({
            status: 'success',
            data: {
                announcement: updatedAnnouncement
            }
        });
    } catch (error) {
        console.error('Error updating announcement:', error);
        next(error);
    }
});

exports.deleteAnnouncement = catchAsync(async (req, res, next) => {
    try {
        const announcement = await Announcement.findByPk(req.params.id);

        if (!announcement) {
            return next(new AppError('Bu ID ile duyuru bulunamadı', 404));
        }

        // Delete the associated image file if it exists
        if (announcement.image) {
            const fs = require('fs');
            const path = require('path');
            const imagePath = path.join('public', announcement.image);

            if (fs.existsSync(imagePath)) {
                fs.unlink(imagePath, (err) => {
                    if (err) console.error('Error deleting announcement image:', err);
                });
            }
        }

        await announcement.destroy();

        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (error) {
        console.error('Error deleting announcement:', error);
        next(error);
    }
});
