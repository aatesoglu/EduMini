const { DataTypes, Op } = require('sequelize');
const sequelize = require('../config/database');

const Visitor = sequelize.define('Visitor', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  lastVisit: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  visitCount: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  }
}, {
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['ip_address']
    }
  ]
});

// Static method: Ziyaretçi takibi
// Static method: Ziyaretçi takibi
Visitor.trackVisit = async function (ipAddress) {
  // 1 dakikalık bekleme süresi (Daha dinamik görünmesi için düşürüldü)
  const oneMinuteAgo = new Date(Date.now() - 1 * 60 * 1000);

  const visitor = await Visitor.findOne({
    where: {
      ipAddress: ipAddress,
      lastVisit: {
        [Op.gte]: oneMinuteAgo
      }
    }
  });

  if (!visitor) {
    // Son 1 dakikada ziyaret yoksa güncelle
    const existingVisitor = await Visitor.findOne({ where: { ipAddress } });

    if (existingVisitor) {
      return await existingVisitor.update({
        visitCount: existingVisitor.visitCount + 1,
        lastVisit: new Date()
      });
    } else {
      return await Visitor.create({
        ipAddress,
        visitCount: 1,
        lastVisit: new Date()
      });
    }
  }

  return visitor;
};

// Static method: Toplam ziyaretçi sayısı (Görüntülenme sayısı)
Visitor.getTotalVisitors = async function () {
  // Satır sayısı yerine toplam görüntülenme sayısını döndür
  const totalVisits = await Visitor.sum('visitCount');
  return totalVisits || 0;
};

module.exports = Visitor;
