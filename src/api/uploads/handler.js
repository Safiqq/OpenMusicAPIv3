class UploadsHandler {
  constructor(storageService, albumsService, validator) {
    this.storageService = storageService;
    this.albumsService = albumsService;
    this.validator = validator;
  }

  async postUploadImageHandler(request, h) {
    const { cover: data } = request.payload;
    const { id: albumId } = request.params;
    this.validator.validateImageHeaders(data.hapi.headers);
    const fileLocation = await this.storageService.writeFile(data, data.hapi);

    await this.albumsService.updateAlbumCover(fileLocation, albumId);

    const response = h.response({
      status: 'success',
      message: 'Berhasil menambahkan cover album',
      data: {
        fileLocation,
      },
    });
    response.code(201);
    return response;
  }
}

module.exports = UploadsHandler;
