module.exports = (sequelize, DataTypes) => {
    const ProductOrderNeed = sequelize.define(
        "ProductOrderNeed",
        {
            hargaProdukId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            inventoryId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            jumlah: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 1,
            },
        },
        {
            tableName: "product_order_needs",
            timestamps: true,
        }
    );

    ProductOrderNeed.associate = (models) => {
        // Cari model HargaProduk dengan berbagai opsi penamaan
        const TargetHargaProduk =
            models.hargaProduk ||
            models.HargaProduk ||
            models.hargaproduk ||
            models.hargaproduks;

        if (TargetHargaProduk) {
            ProductOrderNeed.belongsTo(TargetHargaProduk, {
                foreignKey: "hargaProdukId",
                as: "hargaProduk",
            });
        } else {
            console.warn(
                "[WARNING] Model hargaProduk tidak ditemukan di ProductOrderNeed.associate"
            );
        }

        // Cari model Inventory dengan berbagai opsi penamaan
        const TargetInventory =
            models.Inventory ||
            models.inventory ||
            models.inventories;

        if (TargetInventory) {
            ProductOrderNeed.belongsTo(TargetInventory, {
                foreignKey: "inventoryId",
                as: "inventory",
            });
        } else {
            console.warn(
                "[WARNING] Model Inventory tidak ditemukan di ProductOrderNeed.associate"
            );
        }
    };

    return ProductOrderNeed;
};