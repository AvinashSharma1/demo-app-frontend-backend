const xlsx = require('xlsx');
const User = require('../model/user-model');
const bycrypt = require('bcryptjs');
const uploadController = async (req,res,next) => {

    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const fs = require("fs");

    const filePath = req.file.path;

    const fileBuffer = fs.readFileSync(filePath);

    // Get the uploaded Excel file
    //const fileBuffer = req.file.buffer;
    console.log('Ref file  :', req.file);
    console.log('fileBuffer :', fileBuffer);

    // Convert the Excel file buffer into a workbook
    const workbook = xlsx.read(fileBuffer, { type: 'buffer' });

    console.log('Sheet names:', workbook.SheetNames);

    // Assuming you have a single sheet in the Excel file
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
        return res.status(400).send('No valid sheet found in the Excel file.');
    }
    const sheet = workbook.Sheets[sheetName];

    // Convert the sheet to an array of objects
    const excelSheetData = xlsx.utils.sheet_to_json(sheet);

    const emailList  = excelSheetData.map((item) => item.Email);
    console.log("Email list :",emailList );

    try {

        const duplicates = findDuplicateEmails(emailList);
        if (duplicates && duplicates.length > 0) {
            console.log('Duplicate emails found in File:', duplicates);
            return res.status(400).json({messsage:"Duplicate email ids found in File", emailList:duplicates});
        } else {

            const existingEmails = await User.find({ email: { $in: emailList } });

            const foundEmails = existingEmails.map((emailKey) => emailKey.email);
            const missingEmails = emailList.filter((email) => !foundEmails.includes(email));

            console.log('Emails found in the database:', foundEmails);
            console.log('Emails not found in the database:', missingEmails);
            if(foundEmails && foundEmails.length > 0)
            {
                return res.status(400).json({messsage:"Duplicate email ids found in Database", emailList:foundEmails});
            }
            else{

                // Use a loop or other logic to save the email addresses
                
                for (const data of excelSheetData) {
                    const hashPassword = bycrypt.hashSync("password");
                    console.log("data itterate :",data);
 
                    const user = new User({
                        name:data.Customer_Name,
                        email:data.Email,
                        pancard:data.Pan_Card_Number,
                        dob:data.Date_of_Birth,
                        password:hashPassword,
                    });

                    try{
                        await user.save();
                    } catch (err){
                        console.log(err);
                    }                    

                }
                return res.status(201).json({message:"User data save successfully!"});

            }
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(400).json({messsage:error.messsage});
    }


    // Store the extracted data or perform further processing
   // console.log('Extracted data:', data);

    // Send a response to the client.
    res.status(200).json({messsage:"Excel file uploaded and processed successfully!"});
}

function findDuplicateEmails(emailArray) {
    const uniqueEmails = [];
    const duplicateEmails = emailArray.filter((email) => {
      if (uniqueEmails.includes(email)) {
        return true; // It's a duplicate
      } else {
        uniqueEmails.push(email);
        return false; // It's unique
      }
    });
  
    return duplicateEmails;
  }
  
  
exports.uploadController = uploadController;

