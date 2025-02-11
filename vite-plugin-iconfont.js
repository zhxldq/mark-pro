import { promises as fs } from 'fs';
import path from 'path';
import axios from 'axios';
import * as cheerio from 'cheerio';

export default function iconfontPlugin(options) {
    const {
        url,
        outputDir = 'src/assets/iconfont',
        fileName = 'iconfont.js',
        jsonFileName = 'iconfont.json'
    } = options;

    return {
        name: 'vite-plugin-iconfont',
        async buildStart() {
            try {
                // 下载 Iconfont 文件
                const response = await axios.get(url);
                const iconfontContent = response.data;

                // 确保输出目录存在
                await fs.mkdir(outputDir, { recursive: true });

                // 将文件保存到指定目录
                const filePath = path.resolve(outputDir, fileName);
                await fs.writeFile(filePath, iconfontContent, 'utf-8');
                console.log(`Iconfont 文件已保存到 ${filePath}`);

                // 解析 Iconfont 文件，提取图标信息
                const $ = cheerio.load(iconfontContent);
                const symbols = $('symbol');
                const iconData = [];

                symbols.each((index, element) => {
                    const symbol = $(element);
                    const iconName = symbol.attr('id');
                    const viewBox = symbol.attr('viewBox');
                    const paths = [];
                    symbol.find('path').each((i, el) => {
                        paths.push($(el).attr('d'));
                    });
                    iconData.push({ iconName, viewBox, paths });
                });

                // 生成 JSON 文件
                const jsonFilePath = path.resolve(outputDir, jsonFileName);
                await fs.writeFile(jsonFilePath, JSON.stringify(iconData, null, 2), 'utf-8');
                console.log(`Iconfont JSON 文件已保存到 ${jsonFilePath}`);
            } catch (error) {
                console.error('下载或处理 Iconfont 文件时出错:', error);
            }
        }
    };
}
