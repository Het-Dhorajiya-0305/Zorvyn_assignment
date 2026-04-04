import { create, getById, getRecords, remove, update } from "../services/record-service.js";


const addRecord = async (req, res) => {
    try {

        const newRecord = await create(req.body, req.user);

        return res.status(201).json({
            success: true,
            message: "record created successfully",
            data: newRecord
        })

    } catch (error) {

        return res.status(error.status || 500).json({
            success: false,
            message: error.message || "Internal Server Error"
        });

    }
}

const getAllRecords = async (req, res) => {
    try {
        const records = await getRecords(req.user, req.query);

        return res.status(200).json({
            success: true,
            message: "Records fetched successfully",
            data: records
        })
    } catch (error) {
        return res.status(error.status || 500).json({
            success: false,
            message: error.message || "Internal Server Error"
        });
    }
}

const updateRecord = async (req, res) => {
    try {

        const record = await update(req.params.id, req.body, req.user)

        return res.status(200).json({
            success: true,
            message: "Record updated successfully",
            data: record
        })
    } catch (error) {
        return res.status(error.status || 500).json({
            success: false,
            message: error.message || "Internal Server Error"
        });
    }

}

const getRecordById = async (req, res) => {

    try {
        const record = await getById(req.params.id, req.user);

        return res.status(200).json({
            success: true,
            message: "Record fetched successfully",
            data: record
        })
    } catch (error) {
        return res.status(error.status || 500).json({
            success: false,
            message: error.message || "Internal Server Error"
        });
    }
}

const deleteRecord = async (req, res) => {
    try {
        await remove(req.params.id, req.user);
        return res.status(204).send();
    } catch (error) {
        return res.status(error.status || 500).json({
            success: false,
            message: error.message || "Internal Server Error"
        });
    }

}


export { addRecord, getAllRecords, updateRecord, getRecordById, deleteRecord };