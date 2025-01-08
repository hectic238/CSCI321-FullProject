using System.Security.Claims;
using CSCI321.Server.Helpers;
using CSCI321.Server.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Cryptography;
using System.Text;
using Amazon.DynamoDBv2.DocumentModel;
using Amazon.DynamoDBv2.Model;

namespace CSCI321.Server.Controllers;

[ApiController]
[Route("api/[controller]")]

    public class MessageController : ControllerBase
    {
        private readonly MessageService _messageService;
        public MessageController(MessageService MessageService)
        {
            _messageService = MessageService;
        }

        [HttpPost("submitMessage")]

        public async Task<IActionResult> createMessageAsync([FromBody]MessageModel newMessageModel)
        {
            await _messageService.CreateAsync(newMessageModel);
            var responseBody = new { message = "SubmittedMessage", body = newMessageModel, status = 200 };
            return Ok(responseBody); 
        }

    }
