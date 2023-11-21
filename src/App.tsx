/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import * as XLSX from "xlsx";
import "./App.css";

type LotteriaNumber = { type: string; data: string[] };
type FullData = {
  date: string;
  data: LotteriaNumber[];
};

const removeFalsy = <T,>(arr: T[]) => arr.filter(Boolean);

const getLastTwoString = (str: string) => {
  return str.substring(str.length - 2, str.length);
};

function App() {
  const [text, setText] = useState("");
  const [saveText, setSaveText] = useState("");
  const [storeData, setStoreData] = useState<FullData[]>([]);
  const crawlData = () => {
    const elements = document.querySelectorAll(".box_kqxs");
    const data = [] as FullData[];
    elements.forEach((e) => {
      const ngayElement = e
        .querySelector(".ngay")
        ?.getElementsByTagName("a")[0].innerText;
      const boxKqxsContentElement = e
        .querySelector(".box_kqxs_content")
        ?.getElementsByTagName("tr");

      const giaiArr2 = [] as LotteriaNumber[];
      [...(boxKqxsContentElement || [])].forEach((e) => {
        const tdEle = e.getElementsByTagName("td");
        const giai = tdEle[0].innerText;
        const giaiSo = tdEle[1].getElementsByTagName("div");
        const giaiArr = [] as string[];
        [...(giaiSo || [])].forEach((e) => {
          giaiArr.push(e.innerText);
        });
        giaiArr2.push({
          type: giai,
          data: giaiArr,
        });
      });
      data.push({
        date: ngayElement || "",
        data: giaiArr2,
      });
    });
    const duplicatedNumber = [] as string[];
    const finalData = removeFalsy(
      storeData.concat(data).map((i) => {
        if (!duplicatedNumber.includes(i.date)) {
          duplicatedNumber.push(i.date);
          return i;
        }
      })
    ) as FullData[];
    finalData.sort(function (a, b) {
      const a1 = a.date.split("/").reverse().join("");
      const b1 = b.date.split("/").reverse().join("");
      return a1.localeCompare(b1); // <-- alternative
    });
    setStoreData(finalData);
    setSaveText("");
  };

  function exportJSONToExcel(sheetName = "Sheet1", fileName = "output.xlsx") {
    // Tạo một workbook mới
    if (storeData && storeData.length > 0) {
      const finalData = storeData.map((i) => {
        const number = [] as string[];
        i.data.forEach((i) => {
          i.data.forEach((i) => {
            number.push(i);
          });
        });
        const a = {} as any;
        number.forEach((i, index) => {
          a[`G${index + 1}`] = getLastTwoString(i);
        });
        return {
          date: i.date,
          ...a,
        };
      });
      //
      console.log(finalData);
      const workbook = XLSX.utils.book_new();

      // Chuyển đổi JSON thành worksheet
      const worksheet = XLSX.utils.json_to_sheet(finalData);

      // Thêm worksheet vào workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

      // Ghi workbook ra file Excel
      XLSX.writeFile(workbook, fileName);
      setStoreData([]);
    }
  }
  return (
    <Box>
      <TextField
        onChange={(e) => setText(e.target.value)}
        id="outlined-basic"
        label="Outlined"
        variant="outlined"
      />
      <Button onClick={() => setSaveText(text)}>Render HTML</Button>
      <Button onClick={() => crawlData()}>Crawl Data</Button>
      <Button onClick={() => exportJSONToExcel()}>Export Data</Button>
      <Typography
        dangerouslySetInnerHTML={{
          __html: saveText.replace(/\r\n/g, "<br>"),
        }}
      ></Typography>
      <Box>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Ngày</TableCell>
                <TableCell>Giải Đặc biệt</TableCell>
                <TableCell>Giải nhất</TableCell>
                <TableCell>Giải Nhì</TableCell>
                <TableCell>Giải Ba</TableCell>
                <TableCell>Giải Tư</TableCell>
                <TableCell>Giải Năm</TableCell>
                <TableCell>Giải Sáu</TableCell>
                <TableCell>Giải Bảy</TableCell>
                <TableCell>Giải Tám</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {storeData.map((row: FullData) => (
                <TableRow
                  key={row.date}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {row.date}
                  </TableCell>
                  {row.data.map((e) => {
                    return (
                      <TableCell>
                        {e.data.map(
                          (i, index) =>
                            `${getLastTwoString(i)}${
                              index + 1 === e.data.length ? "" : ","
                            } `
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
}

export default App;
